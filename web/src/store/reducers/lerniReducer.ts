import { createReducer } from "@reduxjs/toolkit";
import { doAccountDeleteEmailBegin as doAccountDeletePasswordBegin, doAccountDeleteEmailChange, doAccountDeletePasswordChange, doAccountDisplayNameUpdate } from "../../model/account";
import { doAccountDeleteEnd, doAuthRegisterBegin, doAuthRegisterCancel, doAuthRegisterEmailChange, doAuthRegisterEmailFormChange, doAuthRegisterEmailFormSubmitFulfilled, doAuthRegisterEmailVerified, doAuthRegisterEnd, doAuthRegisterNameChange, doAuthRegisterPasswordChange, doAuthRegisterStateUpdate, doAuthSessionBegin, doAuthSessionEnd, doAuthSigninBegin, doAuthSigninCancel, doAuthSigninPasswordBegin, doAuthSigninPasswordChangeEmail, doAuthSigninPasswordChangePassword, doAuthSignout } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { LerniApp } from "../../model/types";
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
import { doAlertPost, doAlertRemove } from "../../model/alert";
import accountDeletePasswordSubmit from "../actions/accountDeletePasswordSubmit";
import alertPost from "../actions/alertPost";
import authRegisterEmailVerified from "../actions/authRegisterEmailVerified";
import libraryReceive from "../actions/libraryReceive";
import { doLibraryReceive } from "../../model/library";
import deckNew from "../actions/deckNew";
import deckReceive from "../actions/deckReceive";
import { doDeckNameUpdate, doDeckReceive } from "../../model/deck";
import deckNameUpdate from "../actions/deckNameUpdate";
import deckNameSubmit from "../actions/deckNameSubmit";
import deckDelete from "../actions/deckDelete";
import flashcardNew from "../actions/flashcardNew";
import flashcardReceive from "../actions/flashcardReceive";
import { doFlashcardReceive } from "../../model/flashcard";

const initialState: LerniApp = {
    cards: {}
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDeleteEmailChange, doAccountDeleteEmailChange)
        .addCase(accountDeleteFacebook.fulfilled, doAccountDeleteEnd)
        .addCase(accountDeleteFacebook.rejected, doErrorDisplay)
        .addCase(accountDeleteGoogle.fulfilled, doAccountDeleteEnd)
        .addCase(accountDeleteGoogle.rejected, doErrorDisplay)
        .addCase(accountDeletePasswordBegin, doAccountDeletePasswordBegin)
        .addCase(accountDeletePasswordChange, doAccountDeletePasswordChange)
        .addCase(accountDeletePasswordSubmit.fulfilled, doAccountDeleteEnd)
        .addCase(accountDeletePasswordSubmit.rejected, doErrorDisplay)
        .addCase(accountDeleteTwitter.fulfilled, doAccountDeleteEnd)
        .addCase(accountDeleteTwitter.rejected, doErrorDisplay)
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(alertRemove, doAlertRemove)
        .addCase(alertPost, doAlertPost)
        .addCase(authRegisterBegin, doAuthRegisterBegin)
        .addCase(authRegisterCancel, doAuthRegisterCancel)
        .addCase(authRegisterEmailChange, doAuthRegisterEmailChange)
        .addCase(authRegisterEmailFormChange, doAuthRegisterEmailFormChange)
        .addCase(authRegisterEmailFormSubmit.fulfilled, doAuthRegisterEmailFormSubmitFulfilled)
        .addCase(authRegisterEmailFormSubmit.rejected, doErrorDisplay)
        .addCase(authRegisterEmailVerified, doAuthRegisterEmailVerified)
        .addCase(authRegisterFacebook.fulfilled, doAuthRegisterEnd)
        .addCase(authRegisterFacebook.pending, doAuthRegisterCancel)
        .addCase(authRegisterFacebook.rejected, doErrorDisplay)
        .addCase(authRegisterGoogle.fulfilled, doAuthRegisterEnd)
        .addCase(authRegisterGoogle.pending, doAuthRegisterCancel)
        .addCase(authRegisterGoogle.rejected, doErrorDisplay)
        .addCase(authRegisterNameChange, doAuthRegisterNameChange)
        .addCase(authRegisterPasswordChange, doAuthRegisterPasswordChange)
        .addCase(authRegisterStateUpdate, doAuthRegisterStateUpdate)
        .addCase(authRegisterTwitter.fulfilled, doAuthRegisterEnd)
        .addCase(authRegisterTwitter.pending, doAuthRegisterCancel)
        .addCase(authRegisterTwitter.rejected, doErrorDisplay)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
        .addCase(authSigninBegin, doAuthSigninBegin)
        .addCase(authSigninCancel, doAuthSigninCancel)
        .addCase(authSigninFacebook.fulfilled, doAuthSessionBegin)
        .addCase(authSigninFacebook.pending, doAuthSigninCancel)
        .addCase(authSigninFacebook.rejected, doErrorDisplay)
        .addCase(authSigninGoogle.fulfilled, doAuthSessionBegin)
        .addCase(authSigninGoogle.pending, doAuthSigninCancel)
        .addCase(authSigninGoogle.rejected, doErrorDisplay)
        .addCase(authSigninPasswordBegin, doAuthSigninPasswordBegin)
        .addCase(authSigninPasswordChangeEmail, doAuthSigninPasswordChangeEmail)
        .addCase(authSigninPasswordChangePassword, doAuthSigninPasswordChangePassword)
        .addCase(authSigninPasswordSubmit.fulfilled, doAuthSessionBegin)
        .addCase(authSigninPasswordSubmit.pending, doAuthSigninCancel)
        .addCase(authSigninPasswordSubmit.rejected, doErrorDisplay)
        .addCase(authSigninTwitter.fulfilled, doAuthSessionBegin)
        .addCase(authSigninTwitter.pending, doAuthSigninCancel)
        .addCase(authSigninTwitter.rejected, doErrorDisplay)
        .addCase(authSignout.pending, doAuthSignout)
        .addCase(deckDelete.rejected, doErrorDisplay)
        .addCase(deckNew.rejected, doErrorDisplay)
        .addCase(deckNameUpdate, doDeckNameUpdate)
        .addCase(deckReceive, doDeckReceive)
        .addCase(deckNameSubmit.rejected, doErrorDisplay)
        .addCase(flashcardNew.rejected, doErrorDisplay)
        .addCase(flashcardReceive, doFlashcardReceive)
        .addCase(libraryReceive, doLibraryReceive)
});
export default lerniReducer;