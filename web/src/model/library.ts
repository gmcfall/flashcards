import { PayloadAction } from "@reduxjs/toolkit";
import { collection, deleteDoc, deleteField, doc, documentId, FieldPath, getDoc, getFirestore, onSnapshot, query, setDoc, Timestamp, Unsubscribe, updateDoc, where } from "firebase/firestore";
import libraryReceive from "../store/actions/libraryReceive";
import metadataReceived from "../store/actions/metadataReceived";
import metadataRemoved from "../store/actions/metadataRemoved";
import { AppDispatch, RootState } from "../store/store";
import { compareTimestamps, toClientTimestamp } from "../util/time";
import { deleteDeck } from "./deck";
import firebaseApp from "./firebaseApp";
import { LIBRARIES, METADATA } from "./firestoreConstants";
import { AccessNotification, ClientLibrary, FirestoreLibrary, LerniApp, Metadata, MetadataEnvelope } from "./types";

export function doLibraryReceive(lerni: LerniApp, action: PayloadAction<FirestoreLibrary>) {

    const clientLibrary = toClientLibrary(action.payload);
    if (!lerni.library) {
        lerni.library = clientLibrary;
    } else {
        const lib = lerni.library;
        lib.resources = clientLibrary.resources;
        lib.notifications = clientLibrary.notifications;
    }
}

export function doMetadataReceived(lerni: LerniApp, action: PayloadAction<MetadataEnvelope>) {
    const lib = lerni.library;
    if (!lib) {
        console.log("ERROR:doMetadataReceived: expected `lerni.library` to be defined");
    } else {
        const envelope = action.payload;
        const metadata = lib.metadata;
        metadata[envelope.id] = envelope.metadata;
    }
}

export function doMetadataRemoved(lerni: LerniApp, action: PayloadAction<string>) {

    const lib = lerni.library;
    if (lib) {
        const id = action.payload;
        delete lib.metadata[id];
    }
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

export function selectLibrary(state: RootState) {
    return state.lerni.library;
}

let unsubscribe: Unsubscribe | null = null;
let libraryUser: string | null = null;
export function subscribeLibrary(dispatch: AppDispatch, userUid: string) {

    if (libraryUser === userUid) {
        // Already subscribed
        return;
    }
    if (unsubscribe) {
        unsubscribe();
    }

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, LIBRARIES, userUid);

    unsubscribe = onSnapshot(docRef, (document) => {
        const lib = toFirestoreLibrary(document.data() as FirestoreLibrary);
        dispatch(libraryReceive(lib));
        updateMetadataSubscriptions(dispatch, lib);
    })
}

function updateMetadataSubscriptions(dispatch: AppDispatch, lib: FirestoreLibrary) {
    const resources = Object.keys(lib.resources);
    const set = new Set<string>(resources);
    const map = metadataUnsubscribeFunctions;
    for (const id in map) {
        if (!set.has(id)) {
            const unsubscribe = map[id];
            unsubscribe();
            delete map[id];
        }
    }
    subscribeMetadata(dispatch, resources);
}

export function libraryUnsubscribe() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribeAllMetadata();
        libraryUser = null;
        unsubscribe = null;
    }
}

const metadataUnsubscribeFunctions: Record<string, Unsubscribe> = {};
export function subscribeMetadata(dispatch: AppDispatch, resources: string[]) {

    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, METADATA);

    resources.forEach(id => {
        if (!metadataUnsubscribeFunctions[id]) {
            const q = query(collectionRef, where(documentId(), "==", id));
            const unsubscribe = onSnapshot(q, snapshot => {
                snapshot.docChanges().forEach( change => {
                    const metadata = change.doc.data() as Metadata;
                    switch (change.type) {
                        case 'added' :
                        case 'modified' :
                            dispatch(metadataReceived({id, metadata}));
                            break;

                        case 'removed' :
                            dispatch(metadataRemoved(id));
                            unsubscribeMetadata(id);
                            break;
                    }
                })
            })
            metadataUnsubscribeFunctions[id] = unsubscribe;
        }
    })
}

function unsubscribeMetadata(id: string) {
    
    const unsubscribe = metadataUnsubscribeFunctions[id];
    if (unsubscribe) {
        unsubscribe();
        delete metadataUnsubscribeFunctions[id];
    }
}

function unsubscribeAllMetadata() {

    for (const id in metadataUnsubscribeFunctions) {
        unsubscribeMetadata(id);
    }
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

function toClientLibrary(lib: FirestoreLibrary) {

    const resources = Object.keys(lib.resources);
    const notifications = Object.values(lib.notifications);

    notifications.sort( (a, b) => compareTimestamps(a.createdAt, b.createdAt) );
    const result: ClientLibrary = {
        resources,
        notifications,
        metadata: {}
    }

    return result;
}

function toFirestoreLibrary(lib: FirestoreLibrary): FirestoreLibrary {
    const resources = lib.resources;
    const notifications: Record<string, AccessNotification> = {}
    const map = lib.notifications;
    for (const key in map) {
        const value = map[key];
        const newValue: AccessNotification = {
            ...value,
            createdAt: toClientTimestamp(value.createdAt as Timestamp)
        }
        notifications[value.id] = newValue;
    }

    return {
        resources,
        notifications
    }
}