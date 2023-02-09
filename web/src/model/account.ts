import { PayloadAction } from "@reduxjs/toolkit";
import { LerniApp0 } from "./types";


export function doAccountDisplayNameUpdate(lerni: LerniApp0, action: PayloadAction<string>) {
    const user = lerni.session?.user;
    if (user) {
        user.displayName=action.payload;
    }
}

export function doAccountDeleteEmailBegin(lerni: LerniApp0, action: PayloadAction) {
    lerni.deleteAccountForm = {
        email: '',
        password: ''
    }
}