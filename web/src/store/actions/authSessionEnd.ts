import { createAction } from '@reduxjs/toolkit';

const authSessionEnd = createAction("auth/session/end");
export default authSessionEnd;