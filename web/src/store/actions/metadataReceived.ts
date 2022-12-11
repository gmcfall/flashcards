import { createAction } from '@reduxjs/toolkit';
import { MetadataEnvelope } from '../../model/types';

/**
 * Receive Metadata that was 'added' or 'modified' in Firestore
 */
const metadataReceived = createAction<MetadataEnvelope>("metadata/received");
export default metadataReceived;