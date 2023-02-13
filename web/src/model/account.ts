import { PayloadAction } from "@reduxjs/toolkit";
import { LerniApp0 } from "./types";

export function doAccountDeleteEmailBegin(lerni: LerniApp0, action: PayloadAction) {
    lerni.deleteAccountForm = {
        email: '',
        password: ''
    }
}
