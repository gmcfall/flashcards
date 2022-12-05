import { createAction } from '@reduxjs/toolkit';

const authRegisterEmailChange = createAction<string>("auth/register/email/change");
export default authRegisterEmailChange;