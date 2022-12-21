import { createAction } from "@reduxjs/toolkit";

/**
 * Updates the `signinActive` property of the `LerniApp`.
 */
const authSignin = createAction<boolean>("auth/signin");
export default authSignin;