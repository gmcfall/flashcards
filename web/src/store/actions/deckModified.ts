import { createAction } from '@reduxjs/toolkit';
import { Deck } from '../../model/types';

/**
 * Receive a 'modified' Deck from the Firestore listener
 */
const deckModified = createAction<Deck>("deck/modified");
export default deckModified;