import { createAction } from '@reduxjs/toolkit';
import { RegisterStage } from "../../model/types"

const authRegisterStageUpdate = createAction<RegisterStage>("auth/register/state/update");
export default authRegisterStageUpdate;