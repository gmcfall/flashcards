import { PayloadAction } from "@reduxjs/toolkit";
import { AuthProvider, createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, getAuth, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User, UserCredential } from "firebase/auth";
import { batch } from "react-redux";
import { Action } from "redux";
import authEmailVerified from "../store/actions/authEmailVerified";
import authRegisterStageUpdate from "../store/actions/authRegisterStageUpdate";
import authSessionBegin from "../store/actions/authSessionBegin";
import authSessionNameUpdate from "../store/actions/authSessionNameUpdate";
import { AppDispatch, RootState } from "../store/store";
import { logError } from "../util/common";
import { deleteOwnedDecks } from "./deck";
import firebaseApp from "./firebaseApp";
import { checkUsernameAvailability, createIdentity, deleteIdentity, getIdentity, replaceAnonymousUsernameAndDisplayName, setAnonymousIdentity, setNewIdentity } from "./identity";
import { createFirestoreLibrary, deleteLibrary, saveLibrary } from "./library";
import { ANONYMOUS, GET_IDENTITY_FAILED, Identity, IDENTITY_NOT_FOUND, INFO, LerniApp, RegisterStage, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_USERNAME_RETRY, REGISTER_EMAIL_VERIFY, REGISTER_PROVIDER_USERNAME, Session, SessionUser, SIGNIN_FAILED, UserNames } from "./types";

export function doAuthRegisterBegin(lerni: LerniApp, action: Action<string>) {
    lerni.authRegisterStage = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(lerni: LerniApp, action: Action<string>) {
    endRegistration(lerni);
}

function endRegistration(lerni: LerniApp) {
    delete lerni.authRegisterStage;
}

export function doAuthEmailVerified(lerni: LerniApp, action: PayloadAction) {
    const user = lerni.session?.user;
    if (user) {
        delete user.requiresEmailVerification;
    }
}

export function doAccountDeleteEnd(lerni: LerniApp, action: PayloadAction<boolean>) {
    delete lerni.session;
    lerni.alertData = {
        message: "Your account has been deleted",
        severity: INFO
    }
}

export function doAuthSignin(lerni: LerniApp, action: PayloadAction<boolean>) {

    if (action.payload) {
        lerni.signinActive = true;
    } else {
        delete lerni.signinActive;
    }
}

export function doAuthSignout(lerni: LerniApp, action: PayloadAction) {
    delete lerni.session;
}

export function doAuthSessionEnd(lerni: LerniApp, action: Action) {
    delete lerni.session;
}


export function doAuthRegisterStageUpdate(lerni: LerniApp, action: PayloadAction<RegisterStage>) {
    lerni.authRegisterStage = action.payload;
}

export function doAuthSessionNameUpdate(lerni: LerniApp, action: PayloadAction<UserNames>) {

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




export function doAuthRegisterEmailVerified(lerni: LerniApp, action: PayloadAction) {
    endRegistration(lerni);
    lerni.alertData = {
        severity: INFO,
        message: "Your email has been verified"
    }
}


export function selectSession(state: RootState) {
    return state.lerni.session;
}

/** Select the currently signed in user or undefined if no user is signed in */
export function selectCurrentUser(state: RootState) {
    return state.lerni?.session?.user;
}

export function selectRegistrationState(state: RootState) {
    return state.lerni.authRegisterStage;
}

export function selectSigninActive(state: RootState) {
    return Boolean(state.lerni.signinActive);
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

export function doAuthSessionBegin(lerni: LerniApp, action: PayloadAction<Session>) {
    lerni.session = action.payload;
}

export function getProviders(user: User) {
    return user.providerData.map(data => data.providerId);
}


export async function providerRegister(dispatch: AppDispatch, provider: AuthProvider) {
    
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

export async function emailPasswordSignIn(email: string, password: string) {
    
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
    debugger
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

export async function providerSignIn(provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);

    let result: UserCredential | null = null;
    try {
        result = await signInWithPopup(auth, provider);
    } catch (error) {
        throw new Error(SIGNIN_FAILED, {cause: error});
    }
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    const providers = getProviders(user);
    const requiresVerification = getRequiresVerification(user);

    let identity: Identity | null = null;
    try {
        identity = await getIdentity(uid);
    } catch (error) {
        await deleteUser(user).catch(
            error => console.error(error)
        );
        throw new Error(GET_IDENTITY_FAILED, {cause: error});
    }

    if (identity === null) {
        await deleteUser(user).catch(
            error => console.error(error)
        );
        throw new Error(IDENTITY_NOT_FOUND);
    }

    return createSession(uid, providers, identity.username, displayName, requiresVerification);
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