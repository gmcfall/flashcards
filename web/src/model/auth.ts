import { PayloadAction } from "@reduxjs/toolkit";
import { AuthProvider, createUserWithEmailAndPassword, EmailAuthProvider, getAuth, sendEmailVerification, signInWithPopup, updateProfile, User } from "firebase/auth";
import { batch } from "react-redux";
import { Action } from "redux";
import authRegisterStageUpdate from "../store/actions/authRegisterStageUpdate";
import authSessionBegin from "../store/actions/authSessionBegin";
import authSessionNameUpdate from "../store/actions/authSessionNameUpdate";
import { AppDispatch, RootState } from "../store/store";
import { deleteOwnedDecks } from "./deck";
import firebaseApp from "./firebaseApp";
import { createIdentity, deleteIdentity, saveNewIdentity } from "./identity";
import { createFirestoreLibrary, deleteLibrary, saveLibrary } from "./library";
import { ANONYMOUS, Identity, INFO, LerniApp, RegisterStage, REGISTER_BEGIN, REGISTER_EMAIL_USERNAME_RETRY, REGISTER_EMAIL_VERIFY, REGISTER_PROVIDER_USERNAME, Session, SIGNIN_BEGIN, SIGNIN_PASSWORD, UserNames } from "./types";

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
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
        throw new Error("submitIdentityCleanup failed: user is not signed in");
    }
    
    if (displayName && displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {displayName});
    }

    const identity = createIdentity(userUid, username, displayName);
    const usernameOk = saveNewIdentity(identity);
    
    dispatch(authSessionNameUpdate({username, displayName}));

    return usernameOk;
}

export async function submitEmailRegistrationForm(
    dispatch: AppDispatch,
    email: string, 
    password: string, 
    displayName: string, 
    username: string
) {
    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    await updateProfile(user, {displayName});

    const requiresVerification = getRequiresVerification(user);
    const providers = getProviders(user);
    const session = createSession(user.uid, providers, displayName, requiresVerification);
    const identity = createIdentity(user.uid, username, displayName);
    const usernameOk = await persistUserData(identity);
    if (usernameOk) {
        const sessionUser = session.user;
        if (sessionUser) {
            sessionUser.username = username;
        }
    }
    dispatch(authSessionBegin(session));

    return usernameOk;
}

async function persistUserData(identity: Identity) {

    const lib = createFirestoreLibrary();
    await saveLibrary(identity.uid, lib);
    const usernameOk = await saveNewIdentity(identity);

    return usernameOk;
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

export function createSession(uid: string, providers: string[], displayName: string, requiresEmailVerification: boolean) : Session {
    return {
        user: {
            uid,
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

export async function createAccountWithEmailAndPassword(
    dispatch: AppDispatch,
    email: string,
    password: string,
    displayName: string,
    username: string
) {

    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {displayName});
    await sendEmailVerification(user);

    const requiresVerification = getRequiresVerification(user);
    const providers = getProviders(user);
    const session = createSession(user.uid, providers, displayName, requiresVerification);
    const identity = createIdentity(user.uid, username, displayName);
    const identityOk = await saveNewIdentity(identity);

    const sessionUser = session.user;

    if (identityOk && sessionUser) {
        sessionUser.username = username;
    }

    const lib = createFirestoreLibrary();
    await saveLibrary(user.uid, lib);

    batch(() => {
        dispatch(authSessionBegin(session));
        const nextStage = identityOk ? 
            authRegisterStageUpdate(REGISTER_EMAIL_VERIFY) :
            authRegisterStageUpdate(REGISTER_EMAIL_USERNAME_RETRY);

        dispatch(nextStage);
    });
}

export async function providerRegister(dispatch: AppDispatch, provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);

    // `signInWithPopup` throws an exception if sign-in fails.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    const providers = getProviders(user);
    const requiresVerification = getRequiresVerification(user);

    const session = createSession(uid, providers, displayName, requiresVerification);
    
    const lib = createFirestoreLibrary();
    if (session.user) {
        await saveLibrary(session.user.uid, lib);
    }

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

    return createSession(uid, providers, displayName, requiresVerification);
}