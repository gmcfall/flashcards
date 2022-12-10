import { createAction } from "@reduxjs/toolkit";
import { Flashcard } from "../../model/types";

/**
 * Receive from the Firestore listener, an "added" card
 */
const flashcardModified = createAction<Flashcard>("flashcard/modified");
export default flashcardModified;