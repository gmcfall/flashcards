import { useContext } from "react";
import { ListenerOptions, lookupEntity, startDocListener, toTuple, validatePath } from "./common";
import { FirebaseContext } from "./FirebaseContext";
import LeaseeClient from "./LeaseeClient";
import { EntityTuple, PathElement } from "./types";
import { hashEntityKey } from "./util";
import { useEffect } from 'react';

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

    if (entity) {
        return toTuple(entity);
    }

    return (
        validPath ? ['pending', undefined, undefined] :
        ['idle', undefined, undefined]
    );
}