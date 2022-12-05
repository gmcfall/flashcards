import { createReducer } from "@reduxjs/toolkit";
import { doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthRegisterBegin, doAuthRegisterCancel, doAuthSessionBegin, doAuthSessionEnd, doAuthSigninBegin, doAuthSigninCancel, doAuthSignout } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { DeckApp } from "../../model/types";
import accountDeleteFacebook from "../actions/accountDeleteFacebook";
import accountDeleteGoogle from "../actions/accountDeleteGoogle";
import accountDeleteTwitter from "../actions/accountDeleteTwitter";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authRegisterBegin from "../actions/authRegisterBegin";
import authRegisterCancel from "../actions/authRegisterCancel";
import authRegisterFacebook from "../actions/authRegisterFacebook";
import authRegisterGoogle from "../actions/authRegisterGoogle";
import authRegisterTwitter from "../actions/authRegisterTwitter";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
import authSigninBegin from "../actions/authSigninBegin";
import authSigninCancel from "../actions/authSigninCancel";
import authSigninFacebook from "../actions/authSigninFacebook";
import authSigninGoogle from "../actions/authSigninGoogle";
import authSigninTwitter from "../actions/authSigninTwitter";
import authSignout from "../actions/authSignout";

const initialState: DeckApp = {}

const deckEditorReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(accountDeleteGoogle.fulfilled, doAuthSessionEnd)
        .addCase(accountDeleteFacebook.fulfilled, doAuthSessionEnd)
        .addCase(accountDeleteTwitter.fulfilled, doAuthSessionEnd)
        .addCase(authRegisterBegin, doAuthRegisterBegin)
        .addCase(authRegisterCancel, doAuthRegisterCancel)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
        .addCase(authRegisterGoogle.pending, doAuthRegisterCancel)
        .addCase(authRegisterGoogle.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterGoogle.rejected, doErrorDisplay)
        .addCase(authRegisterFacebook.pending, doAuthRegisterCancel)
        .addCase(authRegisterFacebook.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterFacebook.rejected, doErrorDisplay)
        .addCase(authRegisterTwitter.pending, doAuthRegisterCancel)
        .addCase(authRegisterTwitter.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterTwitter.rejected, doErrorDisplay)
        .addCase(authSignout.pending, doAuthSignout)
        .addCase(authSigninBegin, doAuthSigninBegin)
        .addCase(authSigninCancel, doAuthSigninCancel)
        .addCase(authSigninGoogle.pending, doAuthSigninCancel)
        .addCase(authSigninGoogle.fulfilled, doAuthSessionBegin)
        .addCase(authSigninGoogle.rejected, doErrorDisplay)
        .addCase(authSigninFacebook.pending, doAuthSigninCancel)
        .addCase(authSigninFacebook.fulfilled, doAuthSessionBegin)
        .addCase(authSigninFacebook.rejected, doErrorDisplay)
        .addCase(authSigninTwitter.pending, doAuthSigninCancel)
        .addCase(authSigninTwitter.fulfilled, doAuthSessionBegin)
        .addCase(authSigninTwitter.rejected, doErrorDisplay)
});
export default deckEditorReducer;