import { createAction } from '@reduxjs/toolkit';
import { FirestoreLibrary } from '../../model/types';

/**
 * Receive a library from Firestore
 */
const libraryReceive = createAction<FirestoreLibrary>("library/receive");
export default libraryReceive;