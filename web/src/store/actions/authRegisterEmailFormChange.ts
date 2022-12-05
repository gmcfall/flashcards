import { createAction } from '@reduxjs/toolkit';
import { RegisterEmailForm } from '../../model/types';

const authRegisterEmailFormChange = createAction<RegisterEmailForm>("auth/register/emailForm/change");
export default authRegisterEmailFormChange;