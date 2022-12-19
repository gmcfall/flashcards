import { createAction } from "@reduxjs/toolkit";
import { UserNames } from "../../model/types";

/**
 * Update the user's `displayName` and `username`.
 */
const authSessionNameUpdate = createAction<UserNames>("auth/session/name/update");
export default authSessionNameUpdate;