import { AuthProvider, deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential, reauthenticateWithPopup, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import EntityApi from "../fbase/EntityApi";
import { setAuthUser } from "../fbase/functions";
import LeaseeApi from "../fbase/LeaseeApi";
import { alertError, alertInfo, alertSuccess } from "./alert";
import { deleteOwnedDecks } from "./deck";
import firebaseApp from "./firebaseApp";
import { IDENTITIES } from "./firestoreConstants";
import { deleteIdentity, getIdentity, replaceAnonymousUsernameAndDisplayName as saveUserProfile, setAnonymousIdentity, watchCurrentUserIdentity } from "./identity";
import { createFirestoreLibrary, deleteLibrary, saveLibrary } from "./library";
import { ANONYMOUS, GET_IDENTITY_FAILED, Identity, IDENTITY_NOT_FOUND, LerniApp, SessionUser, SignInResult, SIGNIN_FAILED, SIGNIN_OK, UserProfile } from "./types";

export async function updateUserProfile(
    api: EntityApi,
    user: SessionUser,
    profile: UserProfile
) {

    const usernameOk = await saveUserProfile(user, profile);
    if (usernameOk) {
        const displayName = profile.displayName;
        if (displayName !== user.displayName) {
            const auth = getAuth(api.getClient().firebaseApp);
            const authUser = auth.currentUser;
            if (!authUser) {
                throw new Error("updateUserProfile failed: user is not signed in");
            }
            await updateProfile(authUser, {displayName});
        }
    }

    return usernameOk;
}

export async function resendEmailVerification() {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (user) {
        await sendEmailVerification(user);
    }
}



export async function deleteUserData(userUid: string) {

    const promises: Promise<any>[] = [
        deleteLibrary(userUid),
        deleteIdentity(userUid),
        deleteOwnedDecks(userUid)
    ];

    return Promise.all(promises);
}

export function userProfileIsIncomplete(user: SessionUser) {
    return (
        user.username === ANONYMOUS ||
        !user.displayName
    )
}

export function getRequiresVerification(user: User) {
    return Boolean(
        !user.providerData || (
            user.providerData.find(data => data.providerId===EmailAuthProvider.PROVIDER_ID) &&
            !user.emailVerified
        )
    )
}

export function createSessionUser(user: User, identity: Identity) {
    const requiresEmailVerification = getRequiresVerification(user);

    const result: SessionUser = {
        uid: user.uid,
        username: identity.username,
        displayName: identity.displayName,
        providers: getProviders(user)
    }

    if (requiresEmailVerification) {
        result.requiresEmailVerification = requiresEmailVerification;
    }

    return result;
}

export function getProviders(user: User) {
    return user.providerData.map(data => data.providerId);
}

export async function providerRegister(api: EntityApi, provider: AuthProvider) {
    const auth = getAuth(api.getClient().firebaseApp);

    // `signInWithPopup` throws an exception if sign-in fails.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
   
    const lib = createFirestoreLibrary();
    const resolved = await Promise.all([
        saveLibrary(uid, lib),
        setAnonymousIdentity(uid, displayName)
    ])

    const identity = resolved[1];
    const sessionUser = createSessionUser(user, identity);
    setAuthUser(api.getClient(), sessionUser);
}


export async function emailPasswordSignIn(api: EntityApi, email: string, password: string) {
    
    const auth = getAuth(api.getClient().firebaseApp);
    let credential: UserCredential | null = null;
    try {
        credential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        return SIGNIN_FAILED;
    }
    const user = credential.user;

    let identity: Identity | null = null;
    try {
        identity = await getIdentity(user.uid);
    } catch (error) {
        console.error(error);
        return GET_IDENTITY_FAILED;
    }
    if (!identity) {
        return IDENTITY_NOT_FOUND;
    }
    const sessionUser = createSessionUser(user, identity);
    setAuthUser(api.getClient(), sessionUser);
    alertSuccess(api, "Welcome back!");
    return SIGNIN_OK;
}


export async function providerSignIn(api: EntityApi, provider: AuthProvider) : Promise<SignInResult> {
    const firebaseApp = api.getClient().firebaseApp;
    const auth = getAuth(firebaseApp);
    let result: UserCredential | null = null;
    try {
        result = await signInWithPopup(auth, provider);
    } catch (error) {
        console.error(error);
        return SIGNIN_FAILED;
    }
    const user = result.user;
    const db = getFirestore(firebaseApp);
    const idRef = doc(db, IDENTITIES, user.uid);
    try {
        const idDoc = await getDoc(idRef);
        if (!idDoc.exists()) {
            await deleteUser(user).catch(
                error => console.error(error)
            )
            return IDENTITY_NOT_FOUND;
        }
        const identity = idDoc.data() as Identity;
        const sessionUser = createSessionUser(user, identity);
        setAuthUser(api.getClient(), sessionUser);
        alertSuccess(api, "Welcome back!");
        return SIGNIN_OK;
    } catch (error) {
        console.error(error);
        return GET_IDENTITY_FAILED
    }


}

let verificationIntervalToken: ReturnType<typeof setInterval> | null = null;
export function startEmailVerificationListener(api: EntityApi) {
    if (!verificationIntervalToken) {

        const a = getAuth(firebaseApp);
        const u = a.currentUser;
        if (u) {
            if (getRequiresVerification(u)) {
                verificationIntervalToken = setInterval(() => {
                    const auth = getAuth(firebaseApp);
                    const user = auth.currentUser;
                    if (user) {
                        user.reload().then(
                            () => {
                                const newAuth = getAuth(firebaseApp);
                                const newUser = newAuth.currentUser;
                                if (newUser?.emailVerified) {
                                    stopEmailVerificationListener();
                                    api.mutate(
                                        (lerni: LerniApp) => {
                                            const user = lerni.authUser;
                                            if (user) {
                                                delete user.requiresEmailVerification;
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }, 10000);
            }

        }

    }
}

export function stopEmailVerificationListener() {
    if (verificationIntervalToken) {
        clearInterval(verificationIntervalToken);
        verificationIntervalToken = null;
    }
}

export function userTransform(api: LeaseeApi, user: User) {
    const [, identity] = watchCurrentUserIdentity(api, user.uid);
    if (identity) {
        const sessionUser = createSessionUser(user, identity);
        return sessionUser;
    }
    return undefined;
}

export async function authSignOut(api: EntityApi) {
    const auth = getAuth(api.getClient().firebaseApp);

    try {
        await signOut(auth);
    } catch (error) {
        alertError(api, "An error occurred during sign out", error);
    }
}


export async function deleteAccountViaIdentityProvider(api: EntityApi, provider: AuthProvider) {

    try {
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) {
            throw  new Error("user is not signed in");
        }
        const result = await reauthenticateWithPopup(user, provider);
        const freshUser = result.user;
        await deleteUserData(user.uid);
        await deleteUser(freshUser);
        alertInfo(api, "Your account has been deleted");
    } catch (error) {
        alertError(api, "An error occurred while deleting your account", error);
    }
}

export async function deleteAccountViaEmailProvider(api: EntityApi, email: string, password: string) {
    try {
        const auth = getAuth(api.getClient().firebaseApp);
        const user = auth.currentUser;
        if (!user) {
            throw new Error("Cannot delete account because the user is not signed in");
        }
        const credential = EmailAuthProvider.credential(email, password);

        const result = await reauthenticateWithCredential(user, credential);
        const freshUser = result.user;

        // TODO: add error handlers for deleteUserData

        await deleteUserData(freshUser.uid);
        await deleteUser(freshUser);
        alertInfo(api, "Your account has been deleted");

    } catch (error) {
        alertError(api, "An error occurred while deleting your account", error);
    }
}
