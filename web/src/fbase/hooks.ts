import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import produce from "immer";
import { useContext, useEffect } from "react";
import { isPromise } from "util/types";
import { createEntity, ListenerOptions, lookupEntity, startDocListener, toEntityTuple, validatePath } from "./common";
import { addEntity } from "./EntityClient";
import { FirebaseContext } from "./FirebaseContext";
import { AuthTuple, EntityCache, EntityTuple, PathElement } from "./types";
import { asError, asPromise, hashEntityKey } from "./util";

/**
 * Use a snapshot listener to retrieve data from a Firestore document.
 * @param leasee The name of the component that is leasing the data to be retrieved.
 * @param path The path to the document in Firestore, starting with the name of a collection.
 * @param transform An optional function to transform the data received from Firestore into a new structure
 * @returns An array containing three elements. 
 *      - The first element is the status of the entity; one of "idle", "loading", "success", "error".
 *      - If the status is "success", the second element contains the entity data. Otherwise, the second
 *        element is `undefined`.
 *      - If the status is "error", the third element contains the Error object thrown while fetching
 *        processing the entity. Otherwise, the third element is `undefined`.
 */
export function useDocListener<
    TRaw = unknown, // The raw type stored in Firestore
    TFinal = TRaw,  // The final type, if a transform is applied
>(
    leasee: string,
    path: PathElement[],
    options?: ListenerOptions<TRaw, TFinal>
) : EntityTuple<TFinal> {

    const client = useContext(FirebaseContext);

    if (!client) {
        throw new Error("FirebaseContext was used outside of provider")
    }

    const validPath = validatePath(path);
    const hashValue = validPath ? hashEntityKey(validPath) : '';
    const entity = lookupEntity(client.cache, hashValue);

    useEffect( () => {
        startDocListener<TRaw, TFinal>(
            leasee, client, validPath, hashValue, entity, options
        );

    }, [leasee, hashValue, client, entity, validPath, options])

    return toEntityTuple<TFinal>(entity);
}

/**
 * Options for managing Firebase Authentication
 */
export interface AuthOptions<Type=User> {
    /** A function that transforms the Firebase user into a different structure */
    transform?: ((user: User) => Type) | ((user: User) => Promise<Type>);

    /** A callback that is invoked when it is known that the user is not signed in */
    onSignedOut?: () => void;
}

/** The key under which the authenticated user is stored in the EntityCache */
export const AUTH_USER = 'authUser';

/**
 * 
 * @param options An object with the following properties:
 *      - `transform` A function that transforms the Firebase User into a new type.
 *        This function must have the form `(user: User) => Type` or 
 *        `(user: User) => Promise<Type>` where `Type` is the
 *        type of object to which the Firebase User has been transformed.
 *      - `onSignedOut` A callback that fires when it is known that the user is not signed in.
 *         This function takes no arguments and has no return value, so the signature of the 
 *         callback is `() => void`.
 */
export function useAuthListener<UserType = User>(options?: AuthOptions<UserType>) : AuthTuple<UserType> {

    const transform = options?.transform;
    const onSignedOut = options?.onSignedOut;

    const client = useContext(FirebaseContext);

    if (!client) {
        throw new Error("FirebaseContext was used outside of a provider");
    }

    const entity = lookupEntity(client.cache, AUTH_USER);

    useEffect(() => {
        if (!entity) {
            const auth = getAuth(client.firebaseApp);
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    const data = transform ? transform(user) : user;
                    const promise = asPromise<UserType>(data);
                    promise.then(
                        userObject => {
                            client.setCache(
                                (cache: EntityCache) => {
                                    const nextCache = produce(cache, draftCache => {
                                        const entity = createEntity(unsubscribe, userObject);
                                        addEntity(client, AUTH_USER, entity, AUTH_USER, draftCache)
                                    })
        
                                    return nextCache;
                                }
                            )
                        }
                    ).catch(err => {
                        const error = asError(err, "An error occurred while processing the Firebase User");
                        client.setCache(
                            (cache: EntityCache) => {
                                const nextCache = produce(cache, draftCache => {
                                    const entity = createEntity(unsubscribe, undefined, error);
                                    addEntity(client, AUTH_USER, entity, AUTH_USER, draftCache);
                                })
                                return nextCache;
                            }
                        )
                    })
                } else {
                    if (onSignedOut) {
                        onSignedOut();
                    }
                    client.setCache(
                        (cache: EntityCache) => {
                            const nextCache = produce(cache, draftCache => {
                                const entity = createEntity(unsubscribe, null);
                                addEntity(client, AUTH_USER, entity, AUTH_USER, draftCache)
                            })
                            return nextCache;
                        }
                    )
                }
            }, (error) => {
                client.setCache(
                    (cache: EntityCache) => {
                        const nextCache = produce(cache, draftCache => {
                            const entity = createEntity(unsubscribe, undefined, error);
                            addEntity(client, AUTH_USER, entity, AUTH_USER, draftCache);
                        })
                        return nextCache;
                    }
                )
            })
            // Create a `PendingTuple` and add it to the cache
            client.setCache(
                (cache: EntityCache) => {
                    const nextCache = produce(cache, draftCache => {
                        const entity = createEntity(unsubscribe);
                        addEntity(client, AUTH_USER, entity, AUTH_USER, draftCache, {cacheTime: Number.POSITIVE_INFINITY})
                    })
                    return nextCache;
                }
            )
        }

    }, [entity, client, transform, onSignedOut])
       
    return (
        entity?.data===null ? ['signedOut', null, undefined] :
        entity?.data        ? ['signedIn', entity.data as UserType, undefined] :
        entity?.error       ? ['error', undefined, entity.error] :
                              ['pending', undefined, undefined]
    )
}