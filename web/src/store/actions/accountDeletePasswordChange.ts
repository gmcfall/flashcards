import { createAction } from "@reduxjs/toolkit";

const accountDeletePasswordChange = createAction<string>("account/delete/password/change");
export default accountDeletePasswordChange;