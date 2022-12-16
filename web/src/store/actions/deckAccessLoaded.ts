import { createAction } from '@reduxjs/toolkit';
import { AccessEnvelope } from '../../model/types';

/**
 * Receive from Firestore the Access document for a given Deck.
 */
const deckAccessLoaded = createAction<AccessEnvelope>("deck/access/loaded");
export default deckAccessLoaded;