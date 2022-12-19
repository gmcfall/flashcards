import { collection, deleteDoc, doc, getDocs, getFirestore, limit, query, runTransaction, where } from "firebase/firestore";
import firebaseApp from "./firebaseApp";
import { IDENTITIES } from "./firestoreConstants";
import { Identity } from "./types";

export function createIdentity(uid: string, username: string, displayName: string) : Identity {
    return {uid, username, displayName}
}

/**
 * Check if a given username is available (i.e. is not be used by another user).
 * @param username The username to be checked
 * @returns true if the supplied username is available and false otherwise
 */
export async function checkUsernameAvailability(username: string) {
    const db = getFirestore(firebaseApp);

    const identitiesRef = collection(db, IDENTITIES);
    const q = query(identitiesRef, where("username", "==", username), limit(1));

    const snapshot = await getDocs(q);

    return snapshot.size === 0;

}

export async function saveNewIdentity(identity: Identity) {

    const db = getFirestore(firebaseApp);
    const identityRef = doc(db, IDENTITIES, identity.uid);

    return runTransaction(db, async txn => {
        const identityDoc = await txn.get(identityRef);
        if (identityDoc.exists()) {
            return false;
        } else {
            txn.set(identityRef, identity);
            return true;
        }
    })
}

export async function deleteIdentity(userUid: string) {
    const db = getFirestore(firebaseApp);
    const identityRef = doc(db, IDENTITIES, userUid);
    await deleteDoc(identityRef);
}