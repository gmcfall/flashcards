import { createReducer } from "@reduxjs/toolkit";
import { doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthRegisterBegin, doAuthRegisterCancel, doAuthSessionBegin, doAuthSessionEnd, doAuthSigninBegin, doAuthSigninCancel, doAuthSignout } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { DeckApp } from "../../model/types";
import accountDeleteGoogle from "../actions/accountDeleteGoogle";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authRegisterBegin from "../actions/authRegisterBegin";
import authRegisterCancel from "../actions/authRegisterCancel";
import authRegisterFacebook from "../actions/authRegisterFacebook";
import authRegisterGoogle from "../actions/authRegisterGoogle";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
import authSigninBegin from "../actions/authSigninBegin";
import authSigninCancel from "../actions/authSigninCancel";
import authSigninGoogle from "../actions/authSigninGoogle";
import authSignout from "../actions/authSignout";

const initialState: DeckApp = {}

const deckEditorReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(accountDeleteGoogle.fulfilled, doAuthSessionEnd)
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
        .addCase(authSignout.pending, doAuthSignout)
        .addCase(authSigninBegin, doAuthSigninBegin)
        .addCase(authSigninCancel, doAuthSigninCancel)
        .addCase(authSigninGoogle.pending, doAuthSigninCancel)
        .addCase(authSigninGoogle.fulfilled, doAuthSessionBegin)
        .addCase(authSigninGoogle.rejected, doErrorDisplay)
});
export default deckEditorReducer;