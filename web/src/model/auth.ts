import { PayloadAction } from "@reduxjs/toolkit";
import { AuthProvider, createUserWithEmailAndPassword, EmailAuthProvider, getAuth, sendEmailVerification, signInWithPopup, signOut, updateProfile, User } from "firebase/auth";
import { batch } from "react-redux";
import { Action } from "redux";
import authRegisterStageUpdate from "../store/actions/authRegisterStageUpdate";
import authSessionBegin from "../store/actions/authSessionBegin";
import authSessionNameUpdate from "../store/actions/authSessionNameUpdate";
import { AppDispatch, RootState } from "../store/store";
import { logError } from "../util/common";
import { deleteOwnedDecks } from "./deck";
import firebaseApp from "./firebaseApp";
import { checkUsernameAvailability, createIdentity, deleteIdentity, getIdentity, replaceAnonymousUsernameAndDisplayName, setAnonymousIdentity, setNewIdentity } from "./identity";
import { createFirestoreLibrary, deleteLibrary, saveLibrary } from "./library";
import { ANONYMOUS, INFO, LerniApp, RegisterStage, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_USERNAME_RETRY, REGISTER_EMAIL_VERIFY, REGISTER_PROVIDER_USERNAME, Session, SIGNIN_BEGIN, SIGNIN_PASSWORD, UserNames } from "./types";

export function doAuthRegisterBegin(lerni: LerniApp, action: Action<string>) {
    lerni.authRegisterState = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(lerni: LerniApp, action: Action<string>) {
    endRegistration(lerni);
}

function endRegistration(lerni: LerniApp) {
    delete lerni.authRegisterState;
}

export function doAuthSigninBegin(lerni: LerniApp, action: Action) {
    lerni.signInState = SIGNIN_BEGIN;
    delete lerni.authRegisterState;
}

export function doAccountDeleteEnd(lerni: LerniApp, action: PayloadAction<boolean>) {
    delete lerni.session;
    lerni.alertData = {
        message: "Your account has been deleted",
        severity: INFO
    }
}

export function doAuthSigninCancel(lerni: LerniApp, action: Action) {
    delete lerni.signInState;
    delete lerni.passwordSigninForm;
}

export function doAuthSignout(lerni: LerniApp, action: PayloadAction) {
    delete lerni.session;
}

export function doAuthSessionEnd(lerni: LerniApp, action: Action) {
    delete lerni.session;
}


export function doAuthRegisterStageUpdate(lerni: LerniApp, action: PayloadAction<RegisterStage>) {
    lerni.authRegisterState = action.payload;
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

export function doAuthSigninPasswordBegin(lerni: LerniApp, action: PayloadAction) {
    lerni.signInState = SIGNIN_PASSWORD;
    lerni.passwordSigninForm = {
        email: '',
        password: ''
    }
}

export function doAuthSigninPasswordChangeEmail(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.passwordSigninForm;
    if (form) {
        form.email = action.payload;
    }
}

export function doAuthSigninPasswordChangePassword(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.passwordSigninForm;
    if (form) {
        form.password = action.payload;
    }
}



export function doAuthRegisterEmailVerified(lerni: LerniApp, action: PayloadAction) {
    endRegistration(lerni);
    lerni.alertData = {
        severity: INFO,
        message: "Your email has been verified"
    }
}

export function selectPasswordSigninForm(state: RootState) {
    return state.lerni.passwordSigninForm;
}


export function selectSession(state: RootState) {
    return state.lerni.session;
}

/** Select the currently signed in user or undefined if no user is signed in */
export function selectCurrentUser(state: RootState) {
    return state.lerni?.session?.user;
}

export function selectRegistrationState(state: RootState) {
    return state.lerni.authRegisterState;
}

export function selectSigninState(state: RootState) {
    return state.lerni.signInState;
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
    return {
        user: {
            uid,
            username,
            displayName,
            providers,
            requiresEmailVerification
        }
    }
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

export async function providerSignIn(provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);

    // `signInWithPopup` throws an exception if sign-in fails.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    const providers = getProviders(user);
    const requiresVerification = getRequiresVerification(user);

    const identity = await getIdentity(uid);

    return identity ?
        createSession(uid, providers, identity.username, displayName, requiresVerification) :
        null;
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