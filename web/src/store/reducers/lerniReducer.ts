import { createReducer } from "@reduxjs/toolkit";
import { doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthEmailVerified, doAuthSessionBegin, doAuthSessionEnd } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { doResourceSearchEnd, doResourceSearchRequestPending, doResourceSearchResponsePart } from "../../model/search";
import { LerniApp0 } from "../../model/types";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authEmailVerified from "../actions/authEmailVerified";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";
import resourceSearchEnd from "../actions/resourceSearchEnd";
import resourceSearchRequest from "../actions/resourceSearchRequest";
import resourceSearchResponsePart from "../actions/resourceSearchResponse";

const initialState: LerniApp0 = {
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(authEmailVerified, doAuthEmailVerified)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
        .addCase(resourceSearchEnd, doResourceSearchEnd)
        .addCase(resourceSearchRequest.pending, doResourceSearchRequestPending)
        .addCase(resourceSearchResponsePart, doResourceSearchResponsePart)
});
export default lerniReducer;