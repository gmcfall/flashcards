import { createAction } from '@reduxjs/toolkit';

/**
 * Receive a library from Firestore
 */
const resourceSearchEnd = createAction("resource/search/end");
export default resourceSearchEnd;