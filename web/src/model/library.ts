import { FirestoreLibrary, LIBRARIES } from "./types";
import firebaseApp from "./firebaseApp";
import { doc, getFirestore, setDoc } from "firebase/firestore";

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