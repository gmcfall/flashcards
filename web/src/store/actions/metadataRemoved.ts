import { createAction } from '@reduxjs/toolkit';

/**
 * Fires when a metadata document is deleted in Firestore.
 * The payload value is the `id` of the the resource whose
 * metadata was deleted.
 */
const metadataRemoved = createAction<string>("metadata/removed");
export default metadataRemoved;