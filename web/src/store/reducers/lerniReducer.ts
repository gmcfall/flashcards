import { createReducer } from "@reduxjs/toolkit";
import { doAccountDisplayNameUpdate } from "../../model/account";
import { doAuthEmailVerified, doAuthSessionBegin, doAuthSessionEnd } from "../../model/auth";
import { doErrorDisplay } from "../../model/errorHandler";
import { LerniApp0 } from "../../model/types";
import accountDisplayNameUpdate from "../actions/accountDisplayNameUpdate";
import authEmailVerified from "../actions/authEmailVerified";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";

const initialState: LerniApp0 = {
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(accountDisplayNameUpdate.fulfilled, doAccountDisplayNameUpdate)
        .addCase(accountDisplayNameUpdate.rejected, doErrorDisplay)
        .addCase(authEmailVerified, doAuthEmailVerified)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
});
export default lerniReducer;