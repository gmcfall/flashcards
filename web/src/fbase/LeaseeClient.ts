import { ListenerOptions, lookupEntityTuple, startDocListener, toEntityTuple, validateKey, validatePath } from "./common";
import EntityClient, { claimLease, putEntity, removeLeaseeFromLease } from "./EntityClient";
import Lease from "./Lease";
import { EntityKey, EntityTuple, LeaseOptions, PathElement } from "./types";
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


    constructor(leasee: string, entityClient: EntityClient) {
        this.leasee = leasee;
        this.entityClient = entityClient;
    }
}

export function watchEntity<
    TRaw = unknown,
    TFinal = TRaw
>(
    client: LeaseeClient,
    path: PathElement[],
    options?: ListenerOptions<TRaw, TFinal>
) {

    const validPath = validatePath(path);
    const hashValue = validPath ? hashEntityKey(path) : "";

    startDocListener(client.leasee, client.entityClient, validPath, hashValue, options);


    return lookupEntityTuple<TFinal>(client.entityClient.cache, hashValue);

}

export function setEntity(client: LeaseeClient, key: EntityKey, value: unknown, options?: LeaseOptions) {
    const validKey = validateKey(key);
    if (validKey) {
        const hashValue = hashEntityKey(key);
        const entityClient = client.entityClient;
        putEntity(entityClient, hashValue, value);
        let lease = entityClient.leases.get(hashValue);
        if (!lease) {
            lease = new Lease(hashValue);
            entityClient.leases.set(hashValue, lease);
        }
        claimLease(entityClient, hashValue, client.leasee, options);
    }
}

/**
 * Get a tuple describing an entity in the local cache.
 * @param client The client that provides access to the cache
 * @param entityKey The key under which the entity is stored in the cache
 * @returns A tuple describing the requested entity.
 */
export function getEntity<Type>(client: EntityClient | LeaseeClient, key: EntityKey) {
    const validKey = validateKey(key);
    const hashValue = validKey ? hashEntityKey(key) : "";
    const cache = client.hasOwnProperty("entityClient") ? 
        (client as LeaseeClient).entityClient.cache :
        (client as EntityClient).cache;
    return lookupEntityTuple<Type>(cache, hashValue);
}

/**
 * Get a specific entity from the cache, and start a document listener
 * if the entity is not found in the cache. This function is 
 * similar to the `useDocListener` hook, but it is designed for use in
 * event handlers (including HTML DOM events and events triggered by 
 * other document listeners).
 * 
 * This function has two generic type parameters:
 *  - `TRaw`: The type of the data object in Firestore
 *  - `TFinal`: The final type of the entity if a transform is applied
 * 
 * @param client The LeaseeClient used to fetch the entity
 * @param path The path the document in Firestore
 * @param options Options for managaging the entity. This argument is an object 
 *  with the following optional properties:
 *      - transform: A function that transforms raw data from Firestore into a 
 *          a different structure.  This function has the form 
 *          `(client: LeaseeClient, value: TRaw) => TFinal` 
 *      - onRemove: A callback that fires when the listener reports that the Firestore
 *          document has been removed. The callback has the form
 *          `(client: LeaseeClient, data: TRaw) => void`
 * @returns An EntityTuple describing the requested entity
 */
export function fetchEntity<TRaw = unknown, TFinal = TRaw>(
    client: LeaseeClient,
    path: PathElement[], 
    options?: ListenerOptions<TRaw, TFinal>
) : EntityTuple<TFinal> {

    const validPath = validatePath(path);
    const hashValue = validPath ? hashEntityKey(validPath) : '';
    startDocListener<TRaw, TFinal>(
        client.leasee, client.entityClient, validPath, hashValue, options
    )

    return lookupEntityTuple<TFinal>(client.entityClient.cache, hashValue);
}

/**
 * Release the claim that a leasee has on a specific entity within the local cache
 * @param client LeaseeClient The LeaseeClient that manages leases and entities on behalf of the leasee
 * @param key The EntityKey under which the entity is stored in the local cache
 */
export function releaseClaim(client: LeaseeClient, key: EntityKey) {

    if (validateKey(key)) {
        const hashValue = hashEntityKey(key);
        const lease = client.entityClient.leases.get(hashValue);
        if (lease) {
            const leasee = client.leasee;
            removeLeaseeFromLease(client.entityClient, lease, leasee);
            const leaseeLeases = client.entityClient.leaseeLeases;
            const set = leaseeLeases.get(leasee);
            if (set) {
                set.delete(lease);
                if (set.size === 0) {
                    leaseeLeases.delete(leasee);
                }
            }
        }
    }
}

