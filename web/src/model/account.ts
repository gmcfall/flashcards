import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { LerniApp } from "./types";


export function doAccountDisplayNameUpdate(lerni: LerniApp, action: PayloadAction<string>) {
    const user = lerni.session?.user;
    if (user) {
        user.displayName=action.payload;
    }
}

export function doAccountDeleteEmailBegin(lerni: LerniApp, action: PayloadAction) {
    lerni.deleteAccountForm = {
        email: '',
        password: ''
    }
}

export function doAccountDeleteEmailChange(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.deleteAccountForm!
    form.email = action.payload;
}

export function doAccountDeletePasswordChange(lerni: LerniApp, action: PayloadAction<string>) {
    const form = lerni.deleteAccountForm!
    form.password = action.payload;
}

export function selectDeleteAccountForm(state: RootState) {
    return state.lerni.deleteAccountForm;
}