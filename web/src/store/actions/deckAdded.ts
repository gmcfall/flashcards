import { createAction } from '@reduxjs/toolkit';
import { Deck } from '../../model/types';

/**
 * Receive an 'added' Deck from the Firestore listener
 */
const deckAdded = createAction<Deck>("deck/added");
export default deckAdded;