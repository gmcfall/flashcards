import { PayloadAction } from "@reduxjs/toolkit";
import { Action } from "redux";
import { RootState } from "../store/store";
import { REGISTER_BEGIN, DeckApp, Session, SIGNIN_BEGIN } from "./types";

export function doAuthRegisterBegin(editor: DeckApp, action: Action<string>) {
    editor.authRegisterState = REGISTER_BEGIN;
}

export function doAuthRegisterCancel(editor: DeckApp, action: Action<string>) {
    delete editor.authRegisterState;
}

export function doAuthSigninBegin(editor: DeckApp, action: Action) {
    editor.signInState = SIGNIN_BEGIN;
}

export function doAuthSigninCancel(editor: DeckApp, action: Action) {
    delete editor.signInState;
}

export function doAuthSignout(editor: DeckApp, action: PayloadAction) {
    delete editor.session;
}

export function doAuthSessionEnd(editor: DeckApp, action: Action) {
    delete editor.session;
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

export function createSession(uid: string, providers: string[], displayName: string = "Anonymous") : Session {

    return {
        user: {
            uid,
            displayName,
            providers
        }
    }
}

export function doAuthSessionBegin(editor: DeckApp, action: PayloadAction<Session>) {
    editor.session = action.payload;
}