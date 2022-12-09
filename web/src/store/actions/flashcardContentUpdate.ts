import { createAction } from "@reduxjs/toolkit";


/**
 * Receive the content from the DeckEditor whenever a change is made to the
 * active card.
 */
const flashcardContentUpdate = createAction<string>("flashcard/content/update");
export default flashcardContentUpdate;