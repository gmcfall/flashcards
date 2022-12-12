import { createAction } from "@reduxjs/toolkit";
import {JSONContent} from "@tiptap/core";


/**
 * Receive the content from the DeckEditor whenever a change is made to the
 * active card.
 */
const flashcardContentUpdate = createAction<JSONContent>("flashcard/content/update");
export default flashcardContentUpdate;