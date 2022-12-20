import { createReducer } from "@reduxjs/toolkit";
import { doAccessSet, doDeckAccessLoaded } from "../../model/access";
import { doAccountDeleteEmailBegin as doAccountDeletePasswordBegin, doAccountDeleteEmailChange, doAccountDeletePasswordChange, doAccountDisplayNameUpdate } from "../../model/account";
import { doAlertPost, doAlertRemove } from "../../model/alert";
import {
    doAccountDeleteEnd, doAuthRegisterBegin, doAuthRegisterCancel, doAuthRegisterEmailVerified, doAuthRegisterStageUpdate, doAuthSessionBegin, doAuthSessionEnd, doAuthSessionNameUpdate, doAuthSigninBegin,
    doAuthSigninCancel, doAuthSigninPasswordBegin, doAuthSigninPasswordChangeEmail, doAuthSigninPasswordChangePassword,
    doAuthSignout
} from "../../model/auth";
import { doDeckAdded, doDeckModified, doDeckNameUpdate, doDeckPublishFulfilled } from "../../model/deck";
import { doDeckeditorMount, doDeckeditorNewActiveCardDelete, doDeckeditorUnmount } from "../../model/deckEditor";
import { doErrorDisplay } from "../../model/errorHandler";
import { doFlashcardAdded, doFlashcardAddFulfilled, doFlashcardContentUpdate, doFlashcardModified, doFlashcardRemoved, doFlashcardSelect } from "../../model/flashcard";
import { doLibraryReceive, doMetadataReceived } from "../../model/library";
import { doResourceSearchEnd, doResourceSearchRequestPending, doResourceSearchResponsePart } from "../../model/search";
import { LerniApp } from "../../model/types";
import accessGeneralChange from "../actions/accessGeneralChange";
import accessSet from "../actions/accessSet";
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
import authRegisterEmailVerified from "../actions/authRegisterEmailVerified";
import authRegisterStageUpdate from "../actions/authRegisterStageUpdate";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
import authSessionNameUpdate from "../actions/authSessionNameUpdate";
import authSigninBegin from "../actions/authSigninBegin";
import authSigninCancel from "../actions/authSigninCancel";
import authSigninFacebook from "../actions/authSigninFacebook";
import authSigninGoogle from "../actions/authSigninGoogle";
import authSigninPasswordBegin from "../actions/authSigninPasswordBegin";
import authSigninPasswordChangePassword from "../actions/authSigninPasswordChangePassword";
import authSigninPasswordSubmit from "../actions/authSigninPasswordSubmit";
import authSigninTwitter from "../actions/authSigninTwitter";
import authSignout from "../actions/authSignout";
import authStateChanged from "../actions/authStateChanged";
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
        .addCase(accessSet, doAccessSet)
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
        .addCase(authRegisterEmailVerified, doAuthRegisterEmailVerified)
        .addCase(authRegisterStageUpdate, doAuthRegisterStageUpdate)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
        .addCase(authSessionNameUpdate, doAuthSessionNameUpdate)
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
        .addCase(authStateChanged.rejected, doErrorDisplay)
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