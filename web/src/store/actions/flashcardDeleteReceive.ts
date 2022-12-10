import { createAction } from '@reduxjs/toolkit';
import { Deck } from '../../model/types';

/**
 * Receive notice from Firestore that a given card was deleted
 */
const flashcardDeleteReceive = createAction<string>("flashcard/delete/receive");
export default flashcardDeleteReceive;