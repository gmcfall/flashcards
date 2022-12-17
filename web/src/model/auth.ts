import { PayloadAction } from "@reduxjs/toolkit";
import { EmailAuthProvider, User } from "firebase/auth";
import { Action } from "redux";
import { RootState } from "../store/store";
import { LerniApp, INFO, RegisterEmailForm, RegisterState, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_VERIFY, Session, SIGNIN_BEGIN, SIGNIN_PASSWORD } from "./types";

export function doAuthRegisterBegin(lerni: LerniApp, action: Action<string>) {
    lerni.authRegisterState = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(lerni: LerniApp, action: Action<string>) {
    endRegistration(lerni);
}

function endRegistration(lerni: LerniApp) {
    delete lerni.authRegisterState;
    delete lerni.registerEmailForm;
}

export function doAuthSigninBegin(lerni: LerniApp, action: Action) {
    lerni.signInState = SIGNIN_BEGIN;
    delete lerni.authRegisterState;
    delete lerni.registerEmailForm;
}

export function doAccountDeleteEnd(lerni: LerniApp, action: PayloadAction<boolean>) {
    delete lerni.session;
    lerni.alertData = {
        message: "Your account has been deleted",
        severity: INFO
    }
}

export function doAuthRegisterEnd(lerni: LerniApp, action: PayloadAction<Session>) {
    lerni.session = action.payload;
    alertRegisterEnd(lerni);
}

function alertRegisterEnd(lerni: LerniApp) {
    lerni.alertData = {
        message: "Your account has been created",
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

export function doAuthRegisterEmailFormChange(lerni: LerniApp, action: PayloadAction<RegisterEmailForm>) {
    lerni.registerEmailForm = action.payload;
}

export function doAuthRegisterStateUpdate(lerni: LerniApp, action: PayloadAction<RegisterState>) {
    lerni.authRegisterState = action.payload;

    if (action.payload === REGISTER_EMAIL) {
        lerni.registerEmailForm = {
            email: '',
            password: '',
            displayName: '',
            invalidEmail: false,
            invalidPassword: false,
            invalidDisplayName: false
        }
    }
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

export function doAuthRegisterNameChange(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.registerEmailForm!;
    form.displayName = action.payload;
}

export function doAuthRegisterEmailChange(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.registerEmailForm!;
    form.email = action.payload;
}

export function doAuthRegisterPasswordChange(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.registerEmailForm!;
    form.password = action.payload;
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

export function selectRegisterEmailForm(state: RootState) {
    return state.lerni.registerEmailForm;
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

export function createSession(uid: string, providers: string[], displayName: string, requiresVerification: boolean) : Session {
    return {
        user: {
            uid,
            displayName,
            providers,
            requiresVerification
        }
    }
}

export function doAuthSessionBegin(lerni: LerniApp, action: PayloadAction<Session>) {
    lerni.session = action.payload;
    cancelRegisterAndSigninDialogs(lerni);
}

function cancelRegisterAndSigninDialogs(lerni: LerniApp) {
    delete lerni.signInState;
    delete lerni.registerEmailForm;
    delete lerni.authRegisterState;
    delete lerni.passwordSigninForm;
}

export function doAuthRegisterEmailFormSubmitFulfilled(lerni: LerniApp, action: PayloadAction<Session>) {
    lerni.session = action.payload;
    lerni.authRegisterState = REGISTER_EMAIL_VERIFY;
}