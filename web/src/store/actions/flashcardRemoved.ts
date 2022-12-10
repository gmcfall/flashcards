import { createAction } from "@reduxjs/toolkit";

/**
 * Receive from the Firestore listener, the id of a "removed" card
 */
const flashcardRemoved = createAction<string>("flashcard/removed");
export default flashcardRemoved;