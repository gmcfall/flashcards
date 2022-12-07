import { createAction } from '@reduxjs/toolkit';
import { Deck } from '../../model/types';

/**
 * Receive a Deck from Firestore
 */
const deckReceive = createAction<Deck>("deck/receive");
export default deckReceive;