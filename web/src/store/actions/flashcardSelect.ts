
import { createAction } from '@reduxjs/toolkit';

/**
 * Select a given card by clicking on its thumbnail
 * in the DeckEditor
 */
const flashcardSelect = createAction<string>("flashcard/select");
export default flashcardSelect;