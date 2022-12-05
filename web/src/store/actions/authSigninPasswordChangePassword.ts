import { createAction } from "@reduxjs/toolkit";

const authSigninPasswordChangePassword = createAction<string>("auth/signin/password/change/password");
export default authSigninPasswordChangePassword;