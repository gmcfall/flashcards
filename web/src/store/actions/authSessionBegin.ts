import { createAction } from '@reduxjs/toolkit'
import { Session } from '../../model/types';

const authSessionBegin = createAction<Session>("auth/session/begin");
export default authSessionBegin;