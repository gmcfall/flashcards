import { createAction } from '@reduxjs/toolkit';
import { ResourceSearchResponsePart } from '../../model/types';

/**
 * Receive from Firestore part of the resource search results.
 * In particular receive a ResourceSearchResponsePart of the form:
 * ```
 *  {
 *      tag: string; // One tag derived from the `searchString`
 *      serverData: ResourceSearchServerData
 *  }
 * ```
 */
const resourceSearchResponsePart = createAction<ResourceSearchResponsePart>("resource/search/response/part");
export default resourceSearchResponsePart;