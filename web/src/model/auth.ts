import { PayloadAction } from "@reduxjs/toolkit";
import { EmailAuthProvider, User } from "firebase/auth";
import { Action } from "redux";
import { RootState } from "../store/store";
import { DeckApp, INFO, RegisterEmailForm, RegisterState, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_VERIFY, Session, SIGNIN_BEGIN, SIGNIN_PASSWORD } from "./types";

export function doAuthRegisterBegin(editor: DeckApp, action: Action<string>) {
    editor.authRegisterState = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(editor: DeckApp, action: Action<string>) {
    endRegistration(editor);
}

function endRegistration(editor: DeckApp) {
    delete editor.authRegisterState;
    delete editor.registerEmailForm;
}

export function doAuthSigninBegin(editor: DeckApp, action: Action) {
    editor.signInState = SIGNIN_BEGIN;
    delete editor.authRegisterState;
    delete editor.registerEmailForm;
}

export function doAccountDeleteEnd(editor: DeckApp, action: PayloadAction<boolean>) {
    delete editor.session;
    editor.alertData = {
        message: "Your account has been deleted",
        severity: INFO
    }
}

export function doAuthRegisterEnd(editor: DeckApp, action: PayloadAction<Session>) {
    editor.session = action.payload;
    alertRegisterEnd(editor);
}

function alertRegisterEnd(editor: DeckApp) {
    editor.alertData = {
        message: "Your account has been created",
        severity: INFO
    }
}

export function doAuthSigninCancel(editor: DeckApp, action: Action) {
    delete editor.signInState;
    delete editor.passwordSigninForm;
}

export function doAuthSignout(editor: DeckApp, action: PayloadAction) {
    delete editor.session;
}

export function doAuthSessionEnd(editor: DeckApp, action: Action) {
    delete editor.session;
}

export function doAuthRegisterEmailFormChange(editor: DeckApp, action: PayloadAction<RegisterEmailForm>) {
    editor.registerEmailForm = action.payload;
}

export function doAuthRegisterStateUpdate(editor: DeckApp, action: PayloadAction<RegisterState>) {
    editor.authRegisterState = action.payload;

    if (action.payload === REGISTER_EMAIL) {
        editor.registerEmailForm = {
            email: '',
            password: '',
            displayName: '',
            invalidEmail: false,
            invalidPassword: false,
            invalidDisplayName: false
        }
    }
}

export function doAuthSigninPasswordBegin(editor: DeckApp, action: PayloadAction) {
    editor.signInState = SIGNIN_PASSWORD;
    editor.passwordSigninForm = {
        email: '',
        password: ''
    }
}

export function doAuthSigninPasswordChangeEmail(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.passwordSigninForm;
    if (form) {
        form.email = action.payload;
    }
}

export function doAuthSigninPasswordChangePassword(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.passwordSigninForm;
    if (form) {
        form.password = action.payload;
    }
}

export function doAuthRegisterNameChange(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.registerEmailForm!;
    form.displayName = action.payload;
}

export function doAuthRegisterEmailChange(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.registerEmailForm!;
    form.email = action.payload;
}

export function doAuthRegisterPasswordChange(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.registerEmailForm!;
    form.password = action.payload;
}

export function doAuthRegisterEmailVerified(editor: DeckApp, action: PayloadAction) {
    endRegistration(editor);
    editor.alertData = {
        severity: INFO,
        message: "Your email has been verified"
    }
}

export function selectPasswordSigninForm(state: RootState) {
    return state.editor.passwordSigninForm;
}

export function selectRegisterEmailForm(state: RootState) {
    return state.editor.registerEmailForm;
}

export function selectSession(state: RootState) {
    return state.editor.session;
}

export function selectRegistrationState(state: RootState) {
    return state.editor.authRegisterState;
}

export function selectSigninState(state: RootState) {
    return state.editor.signInState;
}

export function getRequiresVerification(user: User) {
    return Boolean(
        !user.providerData || (
            user.providerData.find(data => data.providerId===EmailAuthProvider.PROVIDER_ID) &&
            !user.emailVerified
        )
    )
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

export function doAuthSessionBegin(editor: DeckApp, action: PayloadAction<Session>) {
    editor.session = action.payload;
    cancelRegisterAndSigninDialogs(editor);
}

function cancelRegisterAndSigninDialogs(editor: DeckApp) {
    delete editor.signInState;
    delete editor.registerEmailForm;
    delete editor.authRegisterState;
    delete editor.passwordSigninForm;
}

export function doAuthRegisterEmailFormSubmitFulfilled(editor: DeckApp, action: PayloadAction<Session>) {
    editor.session = action.payload;
    editor.authRegisterState = REGISTER_EMAIL_VERIFY;
}