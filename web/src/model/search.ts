import EntityApi from "../fbase/EntityApi";
import { watchEntity } from "../fbase/functions";
import LeaseeApi from "../fbase/LeaseeApi";
import { last } from "../util/common";
import porterStem from "../util/stemmer";
import { STOP_WORDS } from "../util/stopWords";
import { SEARCH } from "./firestoreConstants";
import { LerniApp, ResourceRef, ResourceSearch, ResourceSearchRequest, ResourceSearchServerData } from "./types";

export function createResourceSearchRequest(searchString: string) {
    const rawSearchTags = searchString.split(' ');

    const tagSet = new Set<string>();
    rawSearchTags.forEach(rawTag => {
        if (rawTag) {
            const lower = rawTag.toLowerCase();
            if (!STOP_WORDS.has(lower)) {
                const tag = porterStem(lower);
                tagSet.add(tag);
            }
        }
    })
    
    const result: ResourceSearchRequest = {
        searchString,
        searchTags: Array.from(tagSet)
    }
    return result;
}

export function resourceSearchPath(tag: string) {
    return [SEARCH, tag];
}

function resourceSearchTransform(api: LeaseeApi, raw: ResourceSearchServerData, path: string[]) {
    api.mutate(
        (lerni: LerniApp) => {
            const search = lerni.resourceSearch;
            // Update the search response only if the search is still active
            if (search) {
                const tag = last(path);
                // Update the response only if the tag is still relevant to the current search
                if (tag && search.request.searchTags.includes(tag)) {
                    const resourceMap = new Map<string, ResourceRef>();
                    // Initialize the resourceMap with resources received previously
                    for (const ref of search.response) {
                        resourceMap.set(ref.id, ref);
                    }
                    // Update the map with resources received now
                    for (const key in raw.resources) {
                        const value = raw.resources[key];
                        resourceMap.set(value.id, value);
                    }
                    const response = Array.from(resourceMap.values());
                    sortSearchResults(response);
                    search.response = response;
                }
            }
        }
    )
    return raw;
}

function sortSearchResults(list: ResourceRef[]) {
    list.sort((a: ResourceRef, b: ResourceRef) => {
        return a.name.localeCompare(b.name);
    })
}

const RESOURCE_SEARCH_OPTIONS = {
    transform: resourceSearchTransform
}

export async function endResourceSearch(api: EntityApi) {
    api.mutate(
        (lerni: LerniApp) => {
            delete lerni.resourceSearch;
        }
    )
}

export async function performResourceSearch(api: EntityApi, searchString: string) {

    api.mutate(
        (lerni: LerniApp) => {
            const request = createResourceSearchRequest(searchString);
        
            const tags = request.searchTags;
        
            const client = api.getClient();
            const resourceMap = new Map<string, ResourceRef>();
            for (const tag of tags) {
                const path = resourceSearchPath(tag);
                const [,data] = watchEntity(client, SEARCH, path, RESOURCE_SEARCH_OPTIONS);
                if (data) {
                    const resources = data.resources;
                    for (const key in resources) {
                        const ref = resources[key];
                        resourceMap.set(ref.id, ref);
                    }
                }
            }
            const response = Array.from(resourceMap.values());
            sortSearchResults(response);

            lerni.resourceSearch = {
                request,
                response
            }
        }
    )

}

export function selectResourceSearch(lerni: LerniApp) {
    return lerni.resourceSearch || emptySearch()
}

function emptySearch() : ResourceSearch {
    return {
        request: {
            searchString: "",
            searchTags: []
        },
        response: []
    }
}
