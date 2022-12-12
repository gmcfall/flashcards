import { createAction } from "@reduxjs/toolkit";
import { ServerFlashcard } from "../../model/types";

/**
 * Receive from the Firestore listener, an "added" card
 */
const flashcardModified = createAction<ServerFlashcard>("flashcard/modified");
export default flashcardModified;