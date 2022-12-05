import { createAction } from '@reduxjs/toolkit';

const authRegisterPasswordChange = createAction<string>("auth/register/password/change");
export default authRegisterPasswordChange;