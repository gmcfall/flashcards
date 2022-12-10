import { createAction } from "@reduxjs/toolkit";
import { Flashcard } from "../../model/types";

/**
 * Receive from the Firestore listener, an "added" card
 */
const flashcardAdded = createAction<Flashcard>("flashcard/added");
export default flashcardAdded;