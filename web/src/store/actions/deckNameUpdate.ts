import { createAction } from "@reduxjs/toolkit";

const deckNameUpdate = createAction<string>("deck/name/update");
export default deckNameUpdate;