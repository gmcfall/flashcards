import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { setAuthUser, watchEntity, DocListenerOptions, DocChangeEvent, UserChangeEvent } from "@gmcfall/react-firebase-state";
import { createSessionUser } from "./auth";
import firebaseApp from "./firebaseApp";
import { IDENTITIES } from "./firestoreConstants";
import { ANONYMOUS, Identity, SessionUser, UserProfile } from "./types";

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

export function userToIdentity(user: SessionUser) : Identity {

    return {
        uid: user.uid,
        username: user.username,
        displayName: user.displayName
    }
}

/**
 * Save an Identity document with "Anonymous" as the `username`.
 * This represents an invalid Identity. The user will be prohibited from
 * using their account until the `username` is changed to something else.
 * @param identity The identity to be saved
 */
export async function setAnonymousIdentity(uid: string, displayName: string) {
    const db = getFirestore(firebaseApp);
    const identity = createIdentity(uid, ANONYMOUS, displayName);
    const identityRef = doc(db, IDENTITIES, uid);
    await setDoc(identityRef, identity);
    return identity;
}

/**
 * Persist a new Identity document in firestore.
 * If the requested `username` is unavailable, the Identity will be saved
 * with "Anonymous" as the `username`. This represents an invalid state that
 * will need to be corrected before the account can be used.
 * 
 * @param identity The identity to be persisted
 * @returns true if the requested username was persisted and false if it was replaced
 *      with "Anonymous".
 */
export async function setNewIdentity(identity: Identity) {
    // TODO: move this operation to a Firestore function
    // On the client-side we don't have the ability to run a query in a transaction.
    // But it is possible using the admin SDK in a cloud function.
    // See https://googleapis.dev/nodejs/firestore/latest/Transaction.html

    // For now we run the query and immediately follow with the `setDoc` operation.
    // We are hoping that the latency is small enough that we won't end up
    // with an inconsistency (i.e. two users with the same `username`)

    const db = getFirestore(firebaseApp);
    const identitiesRef = collection(db, IDENTITIES);
    const docRef = doc(db, IDENTITIES, identity.uid);
    const q = query(identitiesRef, where("username", "==", identity.username), limit(1));

    const snapshot = await getDocs(q);
    const ok = snapshot.size===0;
    const data = ok ? identity : createIdentity(identity.uid, ANONYMOUS, identity.displayName);

    setDoc(docRef, data);

    return ok;
}

export async function replaceAnonymousUsername(uid: string, username: string) {
    // TODO: move this operation to a Firestore function
    // On the client-side we don't have the ability to run a query in a transaction.
    // But it is possible using the admin SDK in a cloud function.
    // See https://googleapis.dev/nodejs/firestore/latest/Transaction.html

    if (username === ANONYMOUS) {
        return false;
    }

    const db = getFirestore(firebaseApp);
    const identitiesRef = collection(db, IDENTITIES);
    const q = query(identitiesRef, where("username", "==", username), limit(1));

    const snapshot = await getDocs(q);
    const ok = snapshot.size===0;
    if (ok) {
        const docRef = doc(db, IDENTITIES, uid);
        await updateDoc(docRef, {username});
    }

    return ok;
}

export async function replaceAnonymousUsernameAndDisplayName(user: SessionUser, profile: UserProfile) {
    // TODO: move this operation to a Firestore function
    // On the client-side we don't have the ability to run a query in a transaction.
    // But it is possible using the admin SDK in a cloud function.
    // See https://googleapis.dev/nodejs/firestore/latest/Transaction.html

    const {username, displayName} = profile;
    
    if (username === ANONYMOUS) {
        return false;
    }

    const updateUsername = username !== user.username;
    const updateDisplayName = displayName !== user.displayName;

    if (updateUsername || updateDisplayName) {

    }

    const usernameOk = !updateUsername || await checkUsernameAvailability(username);

    if (usernameOk) {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, IDENTITIES, user.uid);
        await updateDoc(docRef, {username, displayName});
    }

    return usernameOk;
}


export async function getIdentityByUsername(username: string) {
    username = trimAtSign(username);
    
    const db = getFirestore(firebaseApp);
    const identitiesRef = collection(db, IDENTITIES);
    const q = query(identitiesRef, where("username", "==", username), limit(1));

    const snapshot = await getDocs(q);
    let result: Identity | null = null;
    snapshot.forEach( document => {
        result = document.data() as Identity;
    })
    return result;
}

export async function getIdentity(userUid: string) {
    
    const db = getFirestore(firebaseApp);
    const identityRef = doc(db, IDENTITIES, userUid);
    const identityDoc = await getDoc(identityRef);
    if (identityDoc.exists()) {
        return identityDoc.data() as Identity;
    }

    return null;
}

export async function deleteIdentity(userUid: string) {
    const db = getFirestore(firebaseApp);
    const identityRef = doc(db, IDENTITIES, userUid);
    await deleteDoc(identityRef);
}

function trimAtSign(username: string) {
    while (username.startsWith("@")) {
        username = username.substring(1);
    }
    return username;
}

export function identityPath(userUid: string | undefined) {
    return [IDENTITIES, userUid];
}

function identityTransform(event: DocChangeEvent<Identity>) {
    const api = event.api;
    const identity = event.data;

    const client = api.getClient();

    const auth = getAuth(client.firebaseApp);
    const user = auth.currentUser;
    if (user) {
        const uid = identity.uid;
        if (uid === user.uid) {
            const sessionUser = createSessionUser(user, identity);
            setAuthUser(api, sessionUser);
        }
    }
    return identity;
}


export function watchCurrentUserIdentity(event: UserChangeEvent) {
    const api = event.api;
    const leasee = event.leasee;
    const userUid = event.user.uid;
    const options: DocListenerOptions<Identity> = {
        transform: identityTransform,
        leaseOptions: {
            abandonTime: Number.POSITIVE_INFINITY
        }
    }
    const path = identityPath(userUid);
    return watchEntity(api, leasee, path, options);
}