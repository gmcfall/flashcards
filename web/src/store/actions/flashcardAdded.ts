import { createAction } from "@reduxjs/toolkit";
import { ServerFlashcard } from "../../model/types";

/**
 * Receive from the Firestore listener, an "added" card
 */
const flashcardAdded = createAction<ServerFlashcard>("flashcard/added");
export default flashcardAdded;