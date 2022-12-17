import { createAction } from "@reduxjs/toolkit";
import { AccessEnvelope } from "../../model/types";

/**
 * Set the `deckAccess` member of the `LerniApp`
 */
const accessSet = createAction<AccessEnvelope>("access/set");
export default accessSet;