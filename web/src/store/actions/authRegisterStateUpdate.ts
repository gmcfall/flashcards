import { createAction } from '@reduxjs/toolkit';
import { RegisterState } from "../../model/types"

const authRegisterStateUpdate = createAction<RegisterState>("auth/register/state/update");
export default authRegisterStateUpdate;