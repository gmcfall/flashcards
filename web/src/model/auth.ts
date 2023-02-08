import { PayloadAction } from "@reduxjs/toolkit";
import { AuthProvider, createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, getAuth, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { batch } from "react-redux";
import { Action } from "redux";
import EntityApi from "../fbase/EntityApi";
import EntityClient from "../fbase/EntityClient";
import { mutate, setAuthUser } from "../fbase/functions";
import LeaseeApi from "../fbase/LeaseeApi";
import authEmailVerified from "../store/actions/authEmailVerified";
import authRegisterStageUpdate from "../store/actions/authRegisterStageUpdate";
import authSessionBegin from "../store/actions/authSessionBegin";
import authSessionNameUpdate from "../store/actions/authSessionNameUpdate";
import { AppDispatch, RootState } from "../store/store";
import { logError } from "../util/common";
import { alertError, alertSuccess, setSuccess } from "./alert";
import { deleteOwnedDecks } from "./deck";
import firebaseApp from "./firebaseApp";
import { IDENTITIES } from "./firestoreConstants";
import { checkUsernameAvailability, createIdentity, deleteIdentity, getIdentity, replaceAnonymousUsernameAndDisplayName, setAnonymousIdentity, setNewIdentity, watchCurrentUserIdentity } from "./identity";
import { appGetState } from "./lerni";
import { createFirestoreLibrary, deleteLibrary, saveLibrary } from "./library";
import { ANONYMOUS, GET_IDENTITY_FAILED, Identity, IDENTITY_NOT_FOUND, INFO, LerniApp, LerniApp0, SignInResult, SIGNIN_OK, RegisterStage, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_USERNAME_RETRY, REGISTER_EMAIL_VERIFY, REGISTER_PROVIDER_USERNAME, Session, SessionUser, SIGNIN_FAILED, UserNames } from "./types";

export function doAuthRegisterBegin(lerni: LerniApp0, action: Action<string>) {
    lerni.authRegisterStage = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(lerni: LerniApp0, action: Action<string>) {
    endRegistration(lerni);
}

function endRegistration(lerni: LerniApp0) {
    delete lerni.authRegisterStage;
}

export function doAuthEmailVerified(lerni: LerniApp0, action: PayloadAction) {
    const user = lerni.session?.user;
    if (user) {
        delete user.requiresEmailVerification;
    }
}

export function doAccountDeleteEnd(lerni: LerniApp0, action: PayloadAction<boolean>) {
    delete lerni.session;
    lerni.alertData = {
        message: "Your account has been deleted",
        severity: INFO
    }
}

export function doAuthSessionEnd(lerni: LerniApp0, action: Action) {
    delete lerni.session;
}


export function doAuthRegisterStageUpdate(lerni: LerniApp0, action: PayloadAction<RegisterStage>) {
    lerni.authRegisterStage = action.payload;
}

export function doAuthSessionNameUpdate(lerni: LerniApp0, action: PayloadAction<UserNames>) {

    const session = lerni.session;
    if (session) {
        const user = session.user;
        if (user) {
            const payload = action.payload;
            user.displayName = payload.displayName;
            user.username = payload.username;
        }
    }
}

export async function submitIdentityCleanup(
    dispatch: AppDispatch,
    userUid: string,
    username: string,
    displayName: string
) {
    const usernameOk = await replaceAnonymousUsernameAndDisplayName(userUid, username, displayName);
    if (usernameOk) { 
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) {
            throw new Error("submitIdentityCleanup failed: user is not signed in");
        }
        if (displayName && displayName !== user.displayName) {
            await updateProfile(auth.currentUser, {displayName});
        }
        dispatch(authSessionNameUpdate({username, displayName}));
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

export async function submitEmailRegistrationForm(
    dispatch: AppDispatch,
    email: string, 
    password: string, 
    displayName: string, 
    username: string
) {

    const checkOk = await checkUsernameAvailability(username);
    if (!checkOk) {
        return REGISTER_EMAIL;
    }

    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    if (displayName !== user.displayName) {
        await updateProfile(user, {displayName});
    }

    const requiresVerification = getRequiresVerification(user);
    const providers = getProviders(user);
    const session = createSession(user.uid, providers, username, displayName, requiresVerification);
    const identity = createIdentity(user.uid, username, displayName);
    const usernameOk = await setNewIdentity(identity);
    const lib = createFirestoreLibrary();
    await saveLibrary(user.uid, lib);
    dispatch(authSessionBegin(session));

    return usernameOk ? REGISTER_EMAIL_VERIFY : REGISTER_EMAIL_USERNAME_RETRY;
}


export async function deleteUserData(userUid: string) {

    const promises: Promise<any>[] = [
        deleteLibrary(userUid),
        deleteIdentity(userUid),
        deleteOwnedDecks(userUid)
    ];

    return Promise.all(promises);
}




export function doAuthRegisterEmailVerified(lerni: LerniApp0, action: PayloadAction) {
    endRegistration(lerni);
    lerni.alertData = {
        severity: INFO,
        message: "Your email has been verified"
    }
}

export function selectRegistrationState(state: RootState) {
    return state.lerni.authRegisterStage;
}

export function selectSigninActive(lerni: LerniApp) {
    return Boolean(lerni.signinActive);
}

export function selectAccountIsIncomplete(state: RootState) {
    const lerni = state.lerni;
    const user = lerni.session?.user;
    return Boolean(
        !lerni.authRegisterStage &&
        !lerni.signinActive &&
        user &&
        (
            userProfileIsIncomplete(user) ||
            user.requiresEmailVerification
        )
    )
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

export function createEmptySession() {
    const result: Session = {};
    return result;
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

export function createSession(
    uid: string, 
    providers: string[],
    username: string,
    displayName: string, 
    requiresEmailVerification: boolean
) : Session {

    const user: SessionUser = {
        uid,
        username,
        displayName,
        providers
    }
    if (requiresEmailVerification) {
        user.requiresEmailVerification = true;
    }
    return {user}
}



export function doAuthSessionBegin(lerni: LerniApp0, action: PayloadAction<Session>) {
    lerni.session = action.payload;
}

export function getProviders(user: User) {
    return user.providerData.map(data => data.providerId);
}

export async function providerRegister(client: EntityClient, provider: AuthProvider) {
    const auth = getAuth(firebaseApp);

    // `signInWithPopup` throws an exception if sign-in fails.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    // const username = ANONYMOUS;

    // const identity: Identity = {
    //     uid,
    //     username,
    //     displayName
    // }

    // const sessionUser = createSessionUser(user, identity)
   
    const lib = createFirestoreLibrary();
    await Promise.all([
        saveLibrary(uid, lib),
        setAnonymousIdentity(uid, displayName)
    ])

    mutate(client, (lerni: LerniApp) => {
        lerni.authRegisterStage = REGISTER_PROVIDER_USERNAME;
    })

}


export async function providerRegister0(dispatch: AppDispatch, provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);

    // `signInWithPopup` throws an exception if sign-in fails.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    const username = ANONYMOUS;
    const providers = getProviders(user);
    const requiresVerification = getRequiresVerification(user);

    const session = createSession(uid, providers, username, displayName, requiresVerification);
   
    const lib = createFirestoreLibrary();
    await Promise.all([
        saveLibrary(uid, lib),
        setAnonymousIdentity(uid, displayName)
    ])
    
    batch(()=> {
        dispatch(authSessionBegin(session));
        dispatch(authRegisterStageUpdate(REGISTER_PROVIDER_USERNAME));
    })
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

export async function emailPasswordSignIn0(email: string, password: string) {
    
    const auth = getAuth(firebaseApp);
    let credential: UserCredential | null = null;
    try {
        credential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw new Error(SIGNIN_FAILED, {cause: error})
    }
    const user = credential.user;

    let identity: Identity | null = null;
    try {
        identity = await getIdentity(user.uid);
    } catch (error) {
        throw new Error(GET_IDENTITY_FAILED, {cause: error});
    }
    if (!identity) {
        await deleteUser(user).catch(
            error => console.error(error)
        )
        throw new Error(IDENTITY_NOT_FOUND);
    }
    const providers = getProviders(user);
    const requiresVerification = getRequiresVerification(user);
    return createSession(user.uid, providers, identity.username, identity.displayName, requiresVerification);
}

export function endSignIn(client: EntityClient) {
    const lerni = appGetState(client);
    if (lerni.signinActive) {
        mutate(client, (lerni: LerniApp) => {
            delete lerni.signinActive;
            setSuccess(lerni, "Welcome back!");
        })
    }
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


export async function handleAuthStateChanged(user: User) {

        const identity = await getIdentity(user.uid);
        if (identity) {
            const providers = getProviders(user);
            const requiresVerification = getRequiresVerification(user);
            const uid = user.uid;
            const displayName = identity.displayName;
            const username = identity.username;
            const session = createSession(uid, providers, username, displayName, requiresVerification);
            return session;
        } else {  
            const auth = getAuth(firebaseApp);
            signOut(auth).catch(error => logError(error));
            throw new Error(`User identity not found: uid=${user.uid}, displayName=${user.displayName}`);
        }
}

let verificationIntervalToken: ReturnType<typeof setInterval> | null = null;
export function startEmailVerificationListener(dispatch: AppDispatch) {
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
                                    dispatch(authEmailVerified());
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

export function authBeginSignIn(api: EntityApi) {
    api.mutate((lerni: LerniApp) => {
        lerni.signinActive = true;
    })
}

export function authEndSignIn(api: EntityApi) {
    api.mutate((lerni: LerniApp) => {
        delete lerni.signinActive;
    })
}
