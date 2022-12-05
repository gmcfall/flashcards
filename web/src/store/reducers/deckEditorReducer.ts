import { createReducer } from "@reduxjs/toolkit";
import { doAccountDeleteEmailBegin as doAccountDeletePasswordBegin, doAccountDeleteEmailChange, doAccountDeletePasswordChange, doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthRegisterBegin, doAuthRegisterCancel, doAuthRegisterEmailChange, doAuthRegisterEmailFormChange, doAuthRegisterNameChange, doAuthRegisterPasswordChange, doAuthRegisterStateUpdate, doAuthSessionBegin, doAuthSessionEnd, doAuthSigninBegin, doAuthSigninCancel, doAuthSigninPasswordBegin, doAuthSigninPasswordChangeEmail, doAuthSigninPasswordChangePassword, doAuthSignout } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { DeckApp } from "../../model/types";
import accountDeletePasswordBegin from "../actions/accountDeletePasswordBegin";
import accountDeleteEmailChange from "../actions/accountDeleteEmailChange";
import accountDeleteFacebook from "../actions/accountDeleteFacebook";
import accountDeleteGoogle from "../actions/accountDeleteGoogle";
import accountDeletePasswordChange from "../actions/accountDeletePasswordChange";
import accountDeleteTwitter from "../actions/accountDeleteTwitter";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authRegisterBegin from "../actions/authRegisterBegin";
import authRegisterCancel from "../actions/authRegisterCancel";
import authRegisterEmailChange from "../actions/authRegisterEmailChange";
import authRegisterEmailFormChange from "../actions/authRegisterEmailFormChange";
import authRegisterEmailFormSubmit from "../actions/authRegisterEmailFormSubmit";
import authRegisterFacebook from "../actions/authRegisterFacebook";
import authRegisterGoogle from "../actions/authRegisterGoogle";
import authRegisterNameChange from "../actions/authRegisterNameChange";
import authRegisterPasswordChange from "../actions/authRegisterPasswordChange";
import authRegisterStateUpdate from "../actions/authRegisterStateUpdate";
import authRegisterTwitter from "../actions/authRegisterTwitter";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
import authSigninBegin from "../actions/authSigninBegin";
import authSigninCancel from "../actions/authSigninCancel";
import authSigninFacebook from "../actions/authSigninFacebook";
import authSigninGoogle from "../actions/authSigninGoogle";
import authSigninTwitter from "../actions/authSigninTwitter";
import authSignout from "../actions/authSignout";
import authSigninPasswordBegin from "../actions/authSigninPasswordBegin";
import authSigninPasswordChangeEmail from "../actions/authinSigninPasswordChangeEmail";
import authSigninPasswordChangePassword from "../actions/authSigninPasswordChangePassword";
import authSigninPasswordSubmit from "../actions/authSigninPasswordSubmit";
import alertRemove from "../actions/alertRemove";
import { doAlertRemove } from "../../model/alert";

const initialState: DeckApp = {}

const deckEditorReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(accountDeleteGoogle.fulfilled, doAuthSessionEnd)
        .addCase(accountDeleteFacebook.fulfilled, doAuthSessionEnd)
        .addCase(accountDeleteTwitter.fulfilled, doAuthSessionEnd)
        .addCase(accountDeletePasswordBegin, doAccountDeletePasswordBegin)
        .addCase(accountDeleteEmailChange, doAccountDeleteEmailChange)
        .addCase(accountDeletePasswordChange, doAccountDeletePasswordChange)
        .addCase(alertRemove, doAlertRemove)
        .addCase(authRegisterBegin, doAuthRegisterBegin)
        .addCase(authRegisterCancel, doAuthRegisterCancel)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
        .addCase(authRegisterStateUpdate, doAuthRegisterStateUpdate)
        .addCase(authRegisterGoogle.pending, doAuthRegisterCancel)
        .addCase(authRegisterGoogle.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterGoogle.rejected, doErrorDisplay)
        .addCase(authRegisterFacebook.pending, doAuthRegisterCancel)
        .addCase(authRegisterFacebook.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterFacebook.rejected, doErrorDisplay)
        .addCase(authRegisterTwitter.pending, doAuthRegisterCancel)
        .addCase(authRegisterTwitter.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterTwitter.rejected, doErrorDisplay)
        .addCase(authRegisterEmailFormSubmit.pending, doAuthRegisterCancel)
        .addCase(authRegisterEmailFormSubmit.fulfilled, doAuthSessionBegin)
        .addCase(authRegisterEmailFormSubmit.rejected, doErrorDisplay)
        .addCase(authRegisterEmailChange, doAuthRegisterEmailChange)
        .addCase(authRegisterPasswordChange, doAuthRegisterPasswordChange)
        .addCase(authRegisterNameChange, doAuthRegisterNameChange)
        .addCase(authRegisterEmailFormChange, doAuthRegisterEmailFormChange)
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
        .addCase(authSigninPasswordSubmit.pending, doAuthSigninCancel)
        .addCase(authSigninPasswordSubmit.fulfilled, doAuthSessionBegin)
        .addCase(authSigninPasswordSubmit.rejected, doErrorDisplay)
        .addCase(authSigninPasswordBegin, doAuthSigninPasswordBegin)
        .addCase(authSigninPasswordChangeEmail, doAuthSigninPasswordChangeEmail)
        .addCase(authSigninPasswordChangePassword, doAuthSigninPasswordChangePassword)
});
export default deckEditorReducer;