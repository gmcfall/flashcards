import { collection, documentId, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import produce from 'immer';
import EntityClient, { claimLease, createLeasedEntity, removeEntity } from "./EntityClient";
import LeaseeClient from "./LeaseeClient";
import { Entity, EntityCache, EntityKey, EntityTuple, LeaseOptions, NonIdleTuple, PathElement } from "./types";
import { hashEntityKey } from "./util";

export function toTuple<T>(entity: Entity<T>): NonIdleTuple<T> {
    return (
        entity?.data  ? ["success", entity.data, undefined] :
        entity?.error ? ["error", undefined, entity.error] :
        ["pending", undefined, undefined] 
    )
}

export function toEntityTuple<T>(entity?: Entity<T>) : EntityTuple<T> {
    return (
        entity ? toTuple<T>(entity) :
        ["idle", undefined, undefined]
    )
}

export function validatePath(path: PathElement[]) {
    for (const value of path) {
        
        if (value===undefined) {
            return null;
        }
    }

    return path as string[];
}

export function validateKey(key: EntityKey) {
    if (!key) {
        return null;
    }
    for (const value of key) {
       if (!isValid(value)) {
        return null;
       }
    }
    return key;
}

/**
 * A specialized error that occurs if the user signed in with an identity provider
 * that is incompatible with the identity provider used during registration.
 * Two identity providers are incompatible if they instantiate users with different
 * Firestore `uid` values.
 */
export class IncompatibleIdentityProviderError extends Error {
    constructor(message?: string) {
        super(message || 'An incompatible identity provider was used to sign in');
    }
}

function isValid(value: unknown) {

    if (value === undefined) {
        return false;
    }

    if (typeof value === 'object') {
        if (value) {
            const obj = value as any;
            for (const key in obj) {
                if (!isValid(obj[key])) {
                    return false;
                }
            }
        }
    }
    

    return true;
}


export interface ListenerOptions<TRaw, TFinal=TRaw> {
    transform?: (client: LeaseeClient, value: TRaw, path: string[]) => TFinal;
    onRemove?: (client: LeaseeClient, value: TRaw, path: string[]) => void;
    onError?: (client: LeaseeClient, error: Error, path: string[]) => void;
    leaseOptions?: LeaseOptions;
}

export function startDocListener<
    TRaw = unknown, // The raw type stored in Firestore
    TFinal = TRaw,  // The final type, if a transform is applied
> (
    leasee: string,
    client: EntityClient,
    validPath: string[] | null,
    hashValue: string,
    options?: ListenerOptions<TRaw, TFinal>
) {
    if (!validPath) {
        return;
    }

    const lease = client.leases.get(hashValue);
    const unsubscribe = lease?.unsubscribe;


    const leaseOptions = options?.leaseOptions;
    if (unsubscribe) {
        claimLease(client, hashValue, leasee, leaseOptions);
    } else { 
        
        const transform = options?.transform;
        const onRemove = options?.onRemove;

        
        const collectionName = validPath[0];
        const collectionKeys = validPath.slice(1, validPath.length-1);
        const docId = validPath[validPath.length-1];
        const db = getFirestore(client.firebaseApp);
    
        const collectionRef = collection(db, collectionName, ...collectionKeys);
    
        const q = query(collectionRef, where(documentId(), "==", docId));

        const unsubscribe = onSnapshot(q, snapshot => {

            snapshot.docChanges().forEach(change => {
                switch (change.type) {
                    case 'added':
                    case 'modified': {
                        const data = change.doc.data() as TRaw;

                        const finalData = transform ?
                            transform(new LeaseeClient(leasee, client), data, validPath) :
                            data;

                        putEntity(client, hashValue, {data: finalData});
                        break;
                    }
                    case 'removed': {
                        client.setCache(
                            (currentCache: EntityCache) => {
                                const nextCache = produce(currentCache, draftCache => {
                                    removeEntity(client, hashValue, draftCache);
                                    if (onRemove) {
                                        const data = change.doc.data() as TRaw;
                                        const leaseeClient = new LeaseeClient(leasee, client);
                                        onRemove(leaseeClient, data, validPath);
                                    }
                                })

                                return nextCache;
                            }
                        )
                        break;
                    }
                }
            })
        }, error => {

            putEntity(
                client, 
                hashValue, 
                createEntity(undefined, error)
            );

            const onError = options?.onError;
            if (onError) {
                const leaseeClient = new LeaseeClient(leasee, client);
                onError(leaseeClient, error, validPath);
            }

            
        })

        createLeasedEntity(client, unsubscribe, hashValue, leasee, options?.leaseOptions);
    }

}

export function lookupEntityTuple<T>(cache: EntityCache, key: string | null) : EntityTuple<T> {
    const entity = key === null ? undefined : cache.entities[key];
    return toEntityTuple<T>(entity);
}

export function createEntity(data?: any, error?: Error) {
    const result: Entity<any> = {};
    if (data !== undefined) {
        result.data = data;
    }
    if (error !== undefined) {
        result.error = error;
    }
    
    return result;
}



function putEntity(client: EntityClient, key: string | string[], entity: Entity<any>) {
    console.log('putEntity', {key, entity})
    const setCache = client.setCache;
    const hashValue = Array.isArray(key) ? hashEntityKey(key) : key;

    setCache(
        (oldCache: EntityCache) => {
            const oldEntities = oldCache.entities;
            const newEntities = {
                ...oldEntities,
                [hashValue]: entity
            }

            const newCache = {
                ...oldCache,
                entities: newEntities
            }

            return newCache;
        }
    )
}