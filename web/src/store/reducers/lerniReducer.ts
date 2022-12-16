import { createReducer } from "@reduxjs/toolkit";
import { doDeckAccessLoaded } from "../../model/access";
import { doAccountDeleteEmailBegin as doAccountDeletePasswordBegin, doAccountDeleteEmailChange, doAccountDeletePasswordChange, doAccountDisplayNameUpdate } from "../../model/account";
import { doAlertPost, doAlertRemove } from "../../model/alert";
import { doAccountDeleteEnd, doAuthRegisterBegin, doAuthRegisterCancel, doAuthRegisterEmailChange, doAuthRegisterEmailFormChange, doAuthRegisterEmailFormSubmitFulfilled, doAuthRegisterEmailVerified, doAuthRegisterEnd, doAuthRegisterNameChange, doAuthRegisterPasswordChange, doAuthRegisterStateUpdate, doAuthSessionBegin, doAuthSessionEnd, doAuthSigninBegin, doAuthSigninCancel, doAuthSigninPasswordBegin, doAuthSigninPasswordChangeEmail, doAuthSigninPasswordChangePassword, doAuthSignout } from "../../model/auth";
import { doDeckAdded, doDeckModified, doDeckNameUpdate, doDeckPublishFulfilled } from "../../model/deck";
import { doDeckeditorMount, doDeckeditorNewActiveCardDelete, doDeckeditorUnmount } from "../../model/deckEditor";
import { doErrorDisplay } from "../../model/errorHandler";
import { doFlashcardAdded, doFlashcardAddFulfilled, doFlashcardContentUpdate, doFlashcardModified, doFlashcardRemoved, doFlashcardSelect } from "../../model/flashcard";
import { doLibraryReceive, doMetadataReceived } from "../../model/library";
import { doResourceSearchEnd, doResourceSearchRequestPending, doResourceSearchResponsePart } from "../../model/search";
import { LerniApp } from "../../model/types";
import accessGeneralChange from "../actions/accessGeneralChange";
import accountDeleteEmailChange from "../actions/accountDeleteEmailChange";
import accountDeleteFacebook from "../actions/accountDeleteFacebook";
import accountDeleteGoogle from "../actions/accountDeleteGoogle";
import accountDeletePasswordBegin from "../actions/accountDeletePasswordBegin";
import accountDeletePasswordChange from "../actions/accountDeletePasswordChange";
import accountDeletePasswordSubmit from "../actions/accountDeletePasswordSubmit";
import accountDeleteTwitter from "../actions/accountDeleteTwitter";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import alertPost from "../actions/alertPost";
import alertRemove from "../actions/alertRemove";
import authSigninPasswordChangeEmail from "../actions/authinSigninPasswordChangeEmail";
import authRegisterBegin from "../actions/authRegisterBegin";
import authRegisterCancel from "../actions/authRegisterCancel";
import authRegisterEmailChange from "../actions/authRegisterEmailChange";
import authRegisterEmailFormChange from "../actions/authRegisterEmailFormChange";
import authRegisterEmailFormSubmit from "../actions/authRegisterEmailFormSubmit";
import authRegisterEmailVerified from "../actions/authRegisterEmailVerified";
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
import authSigninPasswordBegin from "../actions/authSigninPasswordBegin";
import authSigninPasswordChangePassword from "../actions/authSigninPasswordChangePassword";
import authSigninPasswordSubmit from "../actions/authSigninPasswordSubmit";
import authSigninTwitter from "../actions/authSigninTwitter";
import authSignout from "../actions/authSignout";
import deckAccessLoaded from "../actions/deckAccessLoaded";
import deckAdd from "../actions/deckAdd";
import deckAdded from "../actions/deckAdded";
import deckDelete from "../actions/deckDelete";
import deckeditorMount from "../actions/deckeditorMount";
import deckeditorNewActiveCardDelete from "../actions/deckeditorNewActiveCardDelete";
import deckeditorUnmount from "../actions/deckeditorUnmount";
import deckModified from "../actions/deckModified";
import deckNameSubmit from "../actions/deckNameSubmit";
import deckNameUpdate from "../actions/deckNameUpdate";
import deckPublish from "../actions/deckPublish";
import flashcardAdd from "../actions/flashcardAdd";
import flashcardAdded from "../actions/flashcardAdded";
import flashcardContentSave from "../actions/flashcardContentSave";
import flashcardContentUpdate from "../actions/flashcardContentUpdate";
import flashcardDelete from "../actions/flashcardDelete";
import flashcardModified from "../actions/flashcardModified";
import flashcardRemoved from "../actions/flashcardRemoved";
import flashcardSelect from "../actions/flashcardSelect";
import libraryReceive from "../actions/libraryReceive";
import metadataReceived from "../actions/metadataReceived";
import resourceSearchEnd from "../actions/resourceSearchEnd";
import resourceSearchRequest from "../actions/resourceSearchRequest";
import resourceSearchResponsePart from "../actions/resourceSearchResponse";

const initialState: LerniApp = {
    cards: {}
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(accessGeneralChange.rejected, doErrorDisplay)
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
        .addCase(deckAdd.rejected, doErrorDisplay)
        .addCase(deckNameUpdate, doDeckNameUpdate)
        .addCase(deckAccessLoaded, doDeckAccessLoaded)
        .addCase(deckAdded, doDeckAdded)
        .addCase(deckModified, doDeckModified)
        .addCase(deckPublish.fulfilled, doDeckPublishFulfilled)
        .addCase(deckPublish.rejected, doErrorDisplay)
        .addCase(deckeditorMount, doDeckeditorMount)
        .addCase(deckeditorUnmount, doDeckeditorUnmount)
        .addCase(deckeditorNewActiveCardDelete, doDeckeditorNewActiveCardDelete)
        .addCase(deckNameSubmit.rejected, doErrorDisplay)
        .addCase(flashcardContentSave.rejected, doErrorDisplay)
        .addCase(flashcardContentUpdate, doFlashcardContentUpdate)
        .addCase(flashcardDelete.rejected, doErrorDisplay)
        .addCase(flashcardAdd.fulfilled, doFlashcardAddFulfilled)
        .addCase(flashcardAdd.rejected, doErrorDisplay)
        .addCase(flashcardAdded, doFlashcardAdded)
        .addCase(flashcardModified, doFlashcardModified)
        .addCase(flashcardRemoved, doFlashcardRemoved)
        .addCase(flashcardSelect, doFlashcardSelect)
        .addCase(libraryReceive, doLibraryReceive)
        .addCase(metadataReceived, doMetadataReceived)
        .addCase(resourceSearchEnd, doResourceSearchEnd)
        .addCase(resourceSearchRequest.pending, doResourceSearchRequestPending)
        .addCase(resourceSearchResponsePart, doResourceSearchResponsePart)
});
export default lerniReducer;