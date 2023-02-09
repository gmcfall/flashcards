import { createReducer } from "@reduxjs/toolkit";
import { doAccessSet, doDeckAccessLoaded } from "../../model/access";
import { doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthEmailVerified, doAuthSessionBegin, doAuthSessionEnd } from "../../model/auth";
import { doDeckAdded, doDeckModified, doDeckNameUpdate, doDeckPublishFulfilled } from "../../model/deck";
import { doDeckeditorMount, doDeckeditorNewActiveCardDelete, doDeckeditorUnmount } from "../../model/deckEditor";
import { doErrorDisplay } from "../../model/errorHandler";
import { doFlashcardAdded, doFlashcardAddFulfilled, doFlashcardContentUpdate, doFlashcardModified, doFlashcardRemoved, doFlashcardSelect } from "../../model/flashcard";
import { doLibraryReceive, doMetadataReceived } from "../../model/library";
import { doResourceSearchEnd, doResourceSearchRequestPending, doResourceSearchResponsePart } from "../../model/search";
import { LerniApp0 } from "../../model/types";
import accessGeneralChange from "../actions/accessGeneralChange";
import accessSet from "../actions/accessSet";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authEmailVerified from "../actions/authEmailVerified";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
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

const initialState: LerniApp0 = {
    cards: {}
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(accessGeneralChange.rejected, doErrorDisplay)
        .addCase(accessSet, doAccessSet)
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(authEmailVerified, doAuthEmailVerified)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
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