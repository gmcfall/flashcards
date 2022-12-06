import { createAction } from "@reduxjs/toolkit";

/**
 * Fires when email verification is complete and has the following effects:
 * - If the registration wizard is still open, it will be closed.
 * - A transient information alert is posted to notify the user that his/her email has been verified
 */
const authRegisterEmailVerified = createAction("auth/register/email/verified");
export default authRegisterEmailVerified;