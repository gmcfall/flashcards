import { createReducer } from "@reduxjs/toolkit";
import { doAuthEmailVerified, doAuthSessionBegin, doAuthSessionEnd } from "../../model/auth";
import { LerniApp0 } from "../../model/types";
import authEmailVerified from "../actions/authEmailVerified";
import authSessionBegin from "../actions/authSessionBegin";
import authSessionEnd from "../actions/authSessionEnd";

const initialState: LerniApp0 = {
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(authEmailVerified, doAuthEmailVerified)
        .addCase(authSessionBegin, doAuthSessionBegin)
        .addCase(authSessionEnd, doAuthSessionEnd)
});
export default lerniReducer;