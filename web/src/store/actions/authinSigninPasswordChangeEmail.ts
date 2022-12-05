import { createAction } from "@reduxjs/toolkit";

const authSigninPasswordChangeEmail = createAction<string>("auth/signin/password/change/email");
export default authSigninPasswordChangeEmail;