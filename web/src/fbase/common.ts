import { collection, documentId, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import EntityClient from "./EntityClient";
import LeaseeClient from "./LeaseeClient";
import { Entity, EntityCache, EntityClientOptions, LeaseOptions, NonIdleTuple, PathElement, Unsubscribe } from "./types";
import { hashEntityKey } from "./util";
import produce from 'immer';

export function toTuple<T>(entity: Entity<T>): NonIdleTuple<T> {
    return (
        entity.data ? ["success", entity.data, undefined] :
        entity.error ? ["error", undefined, entity.error] :
        ["pending", undefined, undefined]
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

export interface ListenerOptions<TRaw, TFinal> {
    transform?: (client: LeaseeClient, value: TRaw) => TFinal;
    onRemove?: (client: LeaseeClient, value: TRaw) => void;
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
    oldEntity: Entity<any> | undefined,
    options?: ListenerOptions<TRaw, TFinal>
) {

    const transform = options?.transform;
    const onRemove = options?.onRemove;
    const leaseOptions = options?.leaseOptions;
    if (validPath && oldEntity) {
        client.claimLease(hashValue, leasee, leaseOptions);
    }

    if (validPath && !oldEntity) {

        // During a given render cycle, multiple components may call
        // `useDocListener` for the same Firestore document. We must
        // ensure that `onSnapshot` gets called only once. Therefore,
        // we use `setCache` to obtain the latest revision of the 
        // cache, and check it for the entity stored under the given
        // `hashValue`.
        client.setCache(
            (latestCache: EntityCache) => {
                const latestEntity = lookupEntity(latestCache, hashValue);
                let unsubscribeVar: Unsubscribe | null = null;
                if (!latestEntity) {
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

                                    client.setCache(
                                        (currentCache: EntityCache) => {
                                            const nextCache = produce(currentCache, draftCache => {
                                                const leaseeClient = new LeaseeClient(leasee, client, draftCache);
                                                const finalData = transform ? transform(leaseeClient, data) : data;
                                                const entity = createEntity(unsubscribe, finalData);
                                                client.addEntity(hashValue, entity, leasee, draftCache);
                                            })

                                            return nextCache;
                                        }
                                    )
                                    break;
                                }
                                case 'removed': {
                                    client.setCache(
                                        (currentCache: EntityCache) => {
                                            const nextCache = produce(currentCache, draftCache => {
                                                client.removeEntity(hashValue, draftCache);
                                                if (onRemove) {
                                                    const data = change.doc.data() as TRaw;
                                                    const leaseeClient = new LeaseeClient(leasee, client, draftCache);
                                                    onRemove(leaseeClient, data);
                                                }
                                            })

                                            return nextCache;
                                        }
                                    )
                                    break;
                                }
                            }
                        })
                    }, err => {
                
                        const error = err as Error;

                        putEntity(
                            client, 
                            hashValue, 
                            createEntity(unsubscribe, undefined, error)
                        );
                        
                    })
                    unsubscribeVar = unsubscribe;
                }

                if (unsubscribeVar) {
                    // Create a `LoadingTuple` and add it to the cache
                    const newCache = produce(latestCache, draftCache => {
                        const entity = createEntity(unsubscribeVar!);
                        client.addEntity(hashValue, entity, leasee, draftCache);
                    }) 
                    return newCache;
                }

                return latestCache;
            }
        )
    }

}

export function lookupEntity(cache: EntityCache, key: string) {
    return cache.entities[key];
}

function createEntity(unsubscribe: () => void, data?: any, error?: Error) {
    const result: Entity<any> = {
        unsubscribe
    }
    if (data !== undefined) {
        result.data = data;
    }
    if (error !== undefined) {
        result.error = error;
    }
    
    return result;
}



function putEntity(client: EntityClient, key: string | string[], entity: Entity<any>) {
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