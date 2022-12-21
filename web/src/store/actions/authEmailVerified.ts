import { createAction } from "@reduxjs/toolkit";

/**
 * Fires when it has been confirmed that the user has verified their email 
 */
const authEmailVerified = createAction("auth/email/verified");
export default authEmailVerified;