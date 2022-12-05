import { createAction } from "@reduxjs/toolkit";

const accountDeleteEmailChange = createAction<string>("account/delete/email/change");
export default accountDeleteEmailChange;