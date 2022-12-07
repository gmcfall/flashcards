import { PayloadAction } from "@reduxjs/toolkit";
import { doc, getFirestore, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
import libraryReceive from "../store/actions/libraryReceive";
import { AppDispatch, RootState } from "../store/store";
import firebaseApp from "./firebaseApp";
import { LIBRARIES } from "./firestoreConstants";
import { ClientLibrary, DeckApp, FirestoreLibrary, ResourceRef } from "./types";

export function doLibraryReceive(editor: DeckApp, action: PayloadAction<ClientLibrary>) {
    editor.library = action.payload;
}

/**
 * Create an empty FirestoreLibrary object. 
 * @returns The FirestoreLibrary object
 */
export function createFirestoreLibrary(): FirestoreLibrary {
    return {
        resources: {}
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
    return state.editor.library;
}

function toClientLibrary(lib: FirestoreLibrary) : ClientLibrary {
    const firestoreResources = Object.values(lib.resources) as ResourceRef[];

    const resources = firestoreResources.sort((a, b) => a.name.localeCompare(b.name))

    return {resources}
}

let unsubscribe: Unsubscribe | null = null;
let libraryUser: string | null = null;
export function librarySubscribe(dispatch: AppDispatch, userUid: string) {

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
        const data = document.data();
        const lib = toClientLibrary(data as FirestoreLibrary);
        dispatch(libraryReceive(lib));
    })
}

export function libraryUnsubscribe() {
    if (unsubscribe) {
        unsubscribe();
        libraryUser = null;
        unsubscribe = null;
    }
}

