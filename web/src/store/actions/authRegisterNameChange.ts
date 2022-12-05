import { createAction } from '@reduxjs/toolkit';

const authRegisterNameChange = createAction<string>("auth/register/name/change");
export default authRegisterNameChange;