import { PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import resourceSearchResponsePart from "../store/actions/resourceSearchResponse";
import { AppDispatch, RootState } from "../store/store";
import porterStem from "../util/stemmer";
import { STOP_WORDS } from "../util/stopWords";
import firebaseApp from "./firebaseApp";
import { SEARCH } from "./firestoreConstants";
import { FULFILLED, LerniApp, PENDING, ResourceRef, ResourceSearchClientData, ResourceSearchRequest, ResourceSearchResponsePart, ResourceSearchServerData } from "./types";

/**
 * Here's a summary of the Search Use Case
 * 
 * Basic Path:
 * ```
 *  1. User types some text into the input element of the search component.
 *  2. The search component creates a `ResourceSearchRequest` that contains
 *      2.1 The search string, and
 *      2.2 An array of "tags" created as follows:
 *          2.2.1 Create an intially empty array of tags, named `tags`.
 *          2.2.2 Split the search string into an array of lowercase words.
 *          2.2.3 For each word in the array, do:
 *              2.2.3.1 Compute the Porter stem for each word in the array.
 *              2.2.3.2 Push the stem into the `tags` array.
 *  3. The search component invokes the `resourceSearchRequest` action creator, which 
 *     implements the following steps:
 *      3.1 Dispatch the `resourceSeachRequest.pending` action
 *      3.2 For each tag in the request, fire a non-blocking Firestore request to 
 *          get the `ResourceSearchServerData` associated with the tag.
 *          Step 5 describes the path that occurs when a response is received from Firestore.
 *  4. The `doResourceSearchRequestPending` action handler receives `resourceSearchRequest.pending` action
 *     and executes the following steps:
 *      4.1 If there is no client data for the search, create new `ResourceSearchClientData` instance
 *          with the following properties:
 *          4.1.1 `searchString` from the request
 *          4.1.2 `searchTags` from the request
 *          4.1.3 `status` set to `pending`
 *          4.1.4 `cache` set to an empty map
 *          4.1.5 `resources` set to an empty array
 *      4.2 Otherwise, do:
 *          4.2.1 Update the client data with the `searchString` from the request
 *          4.2.2 Update the client data with the `searchTags` from the request
 *          4.2.3 Invoke `updateSearchStatus` which executes the following steps:
 *              4.2.3.1 Delete data for tags that are not currently requested
 *              4.2.3.2 If the cache is missing data for at least one tag in the request, 
 *                      set the `status` of the search to "pending" and return.
 *              4.2.3.3 Otherwise, do:
 *                  4.2.3.3.1 Compute the intersection of all `ResourceSearchServerData` 
 *                      instances contained in the cache, capturing the intersection in an array.
 *                  4.2.3.3.2 Sort the intersection array alphabetically
 *                  4.2.3.3.3 Update the client data by setting `resources` equal to the 
 *                      sorted intersection array.
 *                  4.2.3.3.4 Update the `ResourceSearchClientData` by setting `status` to "fulfilled".
 *                  4.2.3.3.5 ZResourceSearchTools opens the pop-up containing the list of matching resources.
 *  5. The `resourceSearchRequest` action handler receives an instance of `ResourceSearchServerData`
 *     from firestore and executes the following steps
 *      5.1 Create a `resourceSearchResultPart` action.
 *      5.2 Dispatch the action.
 *  6. The `doResourceSearchResultPartial` action handler receives the action and executes the following steps:
 *      6.1 Confirm that the payload is still relevant by checking that the tag in the payload
 *          matches a tag in the local client data for the search.
 *      6.2 If the payload is no longer relevant, bail out by returning without making any changes
 *      6.3 Otherwise, do:
 *          6.3.1 Add the payload server data from the payload to the local cache
 *          6.3.2 Convert the `searchTags` array in the client data to a Set.
 *          6.3.3 Invoke `updateSearchStatus` passing the client data and the set of tags.
 *                See step 4.2.3 for details.
 *  7. Eventually, the `doResourceSearchResult` action handler will have received 
 *     `ResourceSearchServerData` for each tag in the `serverTags` of the client data. When that happens,
 *      the following steps occur:
 *      7.1 The `status` is set to `fulfilled`. In that case, the following steps ensue:
 *      7. The search component renders the search results in a pop-up.
 *  8. The user clicks on a resource in the search results
 *      8.1 The search component creates and dispatches a `resource/search/end` action which encapsulates
 *          the id of the selected resource, triggering the following steps
 *          8.1.1 The `resource/search/end controller deletes the client data cache.
 *          8.1.2 The search component sees that the client data is undefined and it closes the pop-up. 
 *      8.2 The search component navigates to `/decks/:resourceId/edit` which causes the Deck Editor
 *          to be rendered.
 * 
 * Alternate Path A: User Clicks pop-up background
 *  Precondition: The pop-pop containg the list of matching resources is open
 *  Steps:
 *      A.1 The user clicks on the pop-up background
 *      A.2 The resource search tool fires the `resource/search/end` action
 *      A.3 The `resource/search/end` handler deletes the client data.
 *      A.4 The resource search component sees that the client data has been deleted and close the pop-up
 * ```     
 *  
 *   
 */

/**
 * This action handler fires whenever the user changes text in the search field, except for the
 * case where the search field is change to an empty string.
 * 
 * See also {@link doResourceSearchEnd}
 */
export function doResourceSearchRequestPending(lerni: LerniApp, action: PayloadAction<undefined, string, {
    arg: ResourceSearchRequest;
    requestId: string;
    requestStatus: "pending";
}, never>) {
    const request = action.meta.arg;
    const searchString = request.searchString;
    if (!searchString) {
        // The search string is empty, so delete the client search data
        // and bail out.
        delete lerni.resourceSearch;
        return;
    }
    const searchTags = request.searchTags;
    const searchClientData = lerni.resourceSearch;
    if (searchClientData) {
        searchClientData.searchString = searchString;
        searchClientData.searchTags = searchTags;
        const newTags = new Set<string>(searchTags);

        updateSearchStatus(searchClientData, newTags);

    } else {
        lerni.resourceSearch = {
            searchString,
            searchTags,
            status: PENDING,
            cache: {},
            resources: []
        }
    }
}

export function createResourceSearchRequest(searchString: string) {
    const rawSearchTags = searchString.split(' ').filter(s => Boolean(s));

    const searchTags: string[] = [];
    rawSearchTags.forEach(rawTag => {
        const lower = rawTag.toLowerCase();
        if (!STOP_WORDS.has(lower)) {
            const tag = porterStem(lower);
            searchTags.push(tag);
        }
    })
    const result: ResourceSearchRequest = {
        searchString,
        searchTags
    }
    return result;
}

export async function performResourceSearch(dispatch: AppDispatch, tags: string[]) {
    const db = getFirestore(firebaseApp);

    for (const tag of tags) {
        const searchRef = doc(db, SEARCH, tag);
        const searchDoc = await getDoc(searchRef);
        const serverData = searchDoc.exists() ? (
            searchDoc.data() as ResourceSearchServerData
        ) : (
            createResourceSearchServerData()
        );
        const responsePart: ResourceSearchResponsePart = {
            tag,
            serverData
        }
        dispatch(resourceSearchResponsePart(responsePart));
    }
}

export function selectResourceSearch(state: RootState) {
    return state.lerni.resourceSearch;
}

function createResourceSearchServerData() {
    const resources: Record<string, ResourceRef> = {};
    const result: ResourceSearchServerData = {
        resources
    }
    return result;
}



/**
 * An action handler that fires when the user changes the content of search field to
 * an empty string or the search field blurs.
 */
export function doResourceSearchEnd(lerni: LerniApp, action: PayloadAction) {
    delete lerni.resourceSearch;
}

function updateSearchStatus(searchClientData: ResourceSearchClientData, requestTags: Set<string>) {
    const cache = searchClientData.cache;


    // Delete data for tags that are not currently requested
    for (const oldTag in cache) {
        if (!requestTags.has(oldTag)) {
            delete cache[oldTag];
        }
    }

    // Set the status to 'pending' if the cache is missing data for
    // at least one tag in the request

    for (const newTag of requestTags) {
        if (!cache[newTag]) {
            searchClientData.status = PENDING;
            return;
        }
    }

    // At this point, we have determined that there is data for all
    // tags in the request, so merge the results, sort them and set the status to fulfilled

    mergeSearchResults(searchClientData);

}

/**
 * Merge the server data into a single array of resource references,
 * set `lerni.search.searchResults, sort the array
 * alphabetically by name, and set the status to 'fulfilled'.
 * 
 * As a precondition the cache of server data is expected to contain a
 * ResourceSearchServerData document for each tag. If the precondition is not 
 * satisfied, the status is set to 'pending' and the 
 * @param searchClientData The client data for managing the search process
 */
function mergeSearchResults(searchClientData: ResourceSearchClientData) {
    
    const requestTags = searchClientData.searchTags;
    const cache = searchClientData.cache;

    // Define a result set where the key is a resource id and the value
    // is a reference to the resource. This result set will be updated as
    // we scan through the list of tags
    let resultSet: Record<string, ResourceRef> | null = null;

    // scan through the list of tags
    for (const tag of requestTags) {
        if (resultSet === null) {
            // We are processing the first tag.
            resultSet = {};
            const serverData = cache[tag];

            // Confirm that we have data in the cache for the given tag
            if (!serverData) {
                // In theory we should never get here, but just in case...
                searchClientData.status = PENDING;
                return;
            }

            // Initialize the result set as the collection of resources from the cache
            resultSet = serverData.resources
        } else {
            // We are processing a subsequent tag (i.e. not the first tag)
            // Compute the intersection of the results that we have collected so far 
            // with the server data from the cache.
            
            // Get the server data from the cache.
            const serverData = cache[tag];

            // Confirm that the server data exists
            if (!serverData) {
                // In theory we should never get here, but just in case...
                searchClientData.status = PENDING;
                return;
            }

            // Compute the intersection
            const intersection: Record<string, ResourceRef> = {};
            const serverResources = serverData.resources;
            for (const id in serverResources) {
                const oldResourceRef = resultSet[id];
                const newResourceRef = serverResources[id];
                if (oldResourceRef && newResourceRef) {
                    intersection[id] = oldResourceRef;
                }
            }
            resultSet = intersection;
        }
    }

    if (resultSet) {
        const resources = Object.values(resultSet);
        resources.sort((a: ResourceRef, b: ResourceRef) => {
            return a.name.localeCompare(b.name);
        })
        searchClientData.resources = resources;
    } else {
        searchClientData.resources = [];
    }

    searchClientData.status = FULFILLED;
    
}

export function doResourceSearchResponsePart(lerni: LerniApp, action: PayloadAction<ResourceSearchResponsePart>) {
    
    const clientSearchData = lerni.resourceSearch;
    if (clientSearchData) {
        const searchTags = clientSearchData.searchTags;
        const payload = action.payload;

        // Confirm that the response is still relevant by checking that the tag in the response
        // matches a tag in the request.

        if (!searchTags.includes(payload.tag)) {
            // The response is no longer relevant. Bail out!
            return;
        }

        // Add server data from the payload to the local cache.
        clientSearchData.cache[payload.tag] = payload.serverData;

        const tagSet = new Set<string>(clientSearchData.searchTags);
        updateSearchStatus(clientSearchData, tagSet);
    }
}




