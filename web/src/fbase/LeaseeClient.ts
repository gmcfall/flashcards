import { ListenerOptions, lookupEntity, startDocListener, toTuple, validatePath } from "./common";
import EntityClient from "./EntityClient";
import { EntityCache, EntityTuple, KeyElement, NonIdleTuple, PathElement } from "./types";
import { hashEntityKey } from "./util";

/**
 * A client that allows a leasee to manage Firebase entities.
 * A leasee is some individual that holds a lease to one or more Firebase entities.
 * Typically, the leasee is a React Component, but it doesn't have to be.
 * 
 * The LeaseeClient encapsulates an [immer](https://immerjs.github.io/immer/) 
 * proxy of an EntityClient cache.  This allows the LeaseeClient to update the cache.
 */
export default class LeaseeClient {

    /** The name of the leasee. Typically this is the name of a React component. */
    readonly leasee: string;

    /** The EntityClient that manages Firebase entities */
    readonly entityClient: EntityClient;

    /** An immer proxy of the EntityClient cache */
    readonly cache: EntityCache;

    constructor(leasee: string, entityClient: EntityClient, cache: EntityCache) {
        this.leasee = leasee;
        this.entityClient = entityClient;
        this.cache = cache;
    }

}

/**
 * Get an entity from a given LeaseeClient without initiating a fetch if it is not found.
 * @param client The LeaseeClient used to retrieve the requested entity.
 * @param key The key under which the entity is stored
 * @returns An array containing three elements:
 *      - The first element is the status of the entity; one of "idle", "loading", "success", or "error".
 *      - If the status is "success", the second element contains the entity data. Otherwise, the second
 *        element is `undefined`.
 *      - If the status is "error", the third element contains the Error object thrown while fetching
 *        or processing the entity. Otherwise, the third element is `undefined`.
 */
export function getEntity<Type>(client: LeaseeClient, key: KeyElement) : EntityTuple<Type> {
    const hashValue = hashEntityKey(key);
    const entity = client.cache.entities[hashValue];
    if (entity) {
        return toTuple<Type>(entity);
    }
    
    return ['idle', undefined, undefined];
}


/**
 * Get an entity from the cache within a given LeaseeClient. If the entity is not found in the cache,
 * start a listener to fetch the entity data from Firestore.
 * @param client The LeaseeClient used to retrieve the requested entity.
 * @param key The key under which the entity is stored in the client cache.
 * @param options An object with the following optional properties"
 *      - `transform` A function that transforms a Firestore document into a new structure.
 *      - `onRemove` An optional callback invoked when the document is removed from Firestore.
 *      - `leaseOptions` Options for the Lease 
 * @returns An array containing three elements. 
 *      - The first element is the status of the entity; one of "loading", "success", "error".
 *      - If the status is "success", the second element contains the entity data. Otherwise, the second
 *        element is `undefined`.
 *      - If the status is "error", the third element contains the Error object thrown while fetching
 *        processing the entity. Otherwise, the third element is `undefined`.
 */
export function fetchEntity<
    TRaw = unknown, // The raw type stored in Firestore
    TFinal = TRaw,  // The final type, if a transform is applied
> (
    client: LeaseeClient,
    key: PathElement[], 
    options?: ListenerOptions<TRaw, TFinal>
): NonIdleTuple<TFinal> {

    const validPath = validatePath(key);
    const hashValue = validPath ? hashEntityKey(validPath) : '';
    const oldEntity = lookupEntity(client.entityClient.cache, hashValue);

    if (oldEntity) {
        return toTuple(oldEntity);
    }
    startDocListener<TRaw, TFinal>(
        client.leasee, client.entityClient, validPath, hashValue, oldEntity, options
    );

    return ['pending', undefined, undefined];
}

