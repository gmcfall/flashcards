import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { DeckApp } from "./types";


export function doAccountDisplayNameUpdate(editor: DeckApp, action: PayloadAction<string>) {
    if (editor.session) {
        editor.session.user.displayName=action.payload;
    }
}

export function doAccountDeleteEmailBegin(editor: DeckApp, action: PayloadAction) {
    editor.deleteAccountForm = {
        email: '',
        password: ''
    }
}

export function doAccountDeleteEmailChange(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.deleteAccountForm!
    form.email = action.payload;
}

export function doAccountDeletePasswordChange(editor: DeckApp, action: PayloadAction<string>) {
    const form = editor.deleteAccountForm!
    form.password = action.payload;
}

export function selectDeleteAccountForm(state: RootState) {
    return state.editor.deleteAccountForm;
}