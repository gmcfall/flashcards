import { createAction } from '@reduxjs/toolkit';
import { ClientLibrary } from '../../model/types';

/**
 * Receive a library from Firestore
 */
const libraryReceive = createAction<ClientLibrary>("library/receive");
export default libraryReceive;