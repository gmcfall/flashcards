import { createReducer } from "@reduxjs/toolkit";
import { doAuthEmailVerified } from "../../model/auth";
import { LerniApp0 } from "../../model/types";
import authEmailVerified from "../actions/authEmailVerified";

const initialState: LerniApp0 = {
}

const lerniReducer = createReducer(initialState, builder => {
    builder
        .addCase(authEmailVerified, doAuthEmailVerified)
});
export default lerniReducer;