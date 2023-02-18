import { deleteDoc, deleteField, doc, FieldPath, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { watchEntity, LeaseeApi } from "@gmcfall/react-firebase-state";
import { compareTimestamps } from "../util/time";
import { deleteDeck } from "./deck";
import firebaseApp from "./firebaseApp";
import { LIBRARIES } from "./firestoreConstants";
import { createMetadataTransform, createRemoveMetadataCallback, metadataPath } from "./metadata";
import { ClientLibrary, FirestoreLibrary, PartialMetadata, SessionUser, UNKNOWN_RESOURCE_TYPE } from "./types";


export function libraryPath(user: string | SessionUser | null | undefined) {
    const userUid = (
        !user ? undefined : (
            (typeof(user) === "string" && user) ||
            (user as SessionUser).uid
        )
    )
    return [LIBRARIES, userUid];
}

export function libraryTransform(api: LeaseeApi, raw: FirestoreLibrary, path: string[]): ClientLibrary {

    const userUid = path[1];
    const resources = libResources(api, raw, userUid);
    const notifications = libNotifications(raw);

    return {
        resources,
        notifications
    }
}

function libNotifications(raw: FirestoreLibrary) {
    const result = Object.values(raw.notifications);
    result.sort((a, b) => -1*compareTimestamps(a.createdAt, b.createdAt));

    return result;
}

function libResources(api: LeaseeApi, raw: FirestoreLibrary, userUid: string) {
    const idList = Object.keys(raw.resources);
    const result: PartialMetadata[] = [];
    const missing: string[] = [];
    const client = api.getClient();
    const leasee = api.leasee;

    const options = {
        transform: createMetadataTransform(userUid),
        onRemove: createRemoveMetadataCallback(userUid)
    }

    idList.forEach(id => {
        const path = metadataPath(id);
        const [, value, error] = watchEntity(client, leasee, path, options);
        if (error) {
            const message = error.message.toLowerCase();
            if (message.includes("missing or insufficient permissions")) {
                missing.push(id);
            } else {
                console.warn(`Ignoring error while getting metadata for resource(id=${id})`, error);
            }
        } else if (value) {
            result.push(value);
        } else {
            result.push({id, name: "Loading...", type: UNKNOWN_RESOURCE_TYPE});
        }
    })

    if (missing.length > 0) {
        // Remove missing resources from the Library
        const resources: Record<string, any> = {};
        missing.forEach(resourceId => {
            resources[resourceId] = deleteField()
        })
        const db = getFirestore(api.getClient().firebaseApp);
        const libRef = doc(db, LIBRARIES, userUid);
        updateDoc(libRef, {resources}).catch(
            error => {
                console.error(`Failed to removing missing resources from library (userUid: ${userUid})`, missing);
            }
        )
    }

    sortResources(result);
    return result;
}

export function sortResources(resources: PartialMetadata[]) {
    resources.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Create an empty FirestoreLibrary object. 
 * @returns The FirestoreLibrary object
 */
export function createFirestoreLibrary(): FirestoreLibrary {
    return {
        resources: {},
        notifications: {}
    }
}

/**
 * Save a given Library to Firestore.
 * @param userUid The `uid` of the user who owns the library
 * @param lib The library object to be stored in Firestore
 * @returns A promise that resolves when the library has been saved to Firestore
 */
export async function saveLibrary(userUid: string, lib: FirestoreLibrary) {
    
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, LIBRARIES, userUid);

    return setDoc(docRef, lib);
}




export async function deleteLibrary(userUid: string) {
    const db = getFirestore(firebaseApp);
    const libRef = doc(db, LIBRARIES, userUid);

    const libDoc = await getDoc(libRef);
    if (libDoc.exists()) {
        const lib = libDoc.data() as FirestoreLibrary;
        for (const resourceId in lib.resources) {
            deleteDeck(resourceId, userUid, false);
        }
    }
    await deleteDoc(libRef);
}

export async function removeNotification(userUid: string, notificationId: string) {
    const db = getFirestore(firebaseApp);

    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath("notifications", notificationId);
    await updateDoc(libRef, path, deleteField());
}
