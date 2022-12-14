import { PayloadAction } from "@reduxjs/toolkit";
import { collection, deleteField, doc, documentId, FieldPath, getDoc, getFirestore, onSnapshot, query, runTransaction, serverTimestamp, Unsubscribe, updateDoc, where, writeBatch } from "firebase/firestore";
import deckAccessLoaded from "../store/actions/deckAccessLoaded";
import { AppDispatch, RootState } from "../store/store";
import { isEmpty } from "../util/common";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { ACCESS, AccessField, LIBRARIES } from "./firestoreConstants";
import { Access, AccessEnvelope, ACCESS_DENIED, EDIT, Identity, IdentityRole, LerniApp, NOT_FOUND, OWNER, Permission, ProtoAccessRequest, ProtoAccessResponse, Role, SHARE, UNKNOWN_ERROR, VIEW, VIEWER } from "./types";

/**
 * A mapping from roles to permissions granted to the role
 */
const PRIVILEGES: Record<Role, Set<Permission>> = {
    owner:  new Set<Permission>([EDIT, VIEW, SHARE]),
    editor: new Set<Permission>([EDIT, VIEW]),
    viewer: new Set<Permission>([VIEW])
}

/**
 * Check whether a given user is granted a particular privilege for a specified resource
 * @param accessEnvelope An envelope containing the access control list
 * @param permission The permission being checked
 * @param resourceId The `id` of the resource being accessed
 * @param userUid The unique identifier of the user
 * @returns true if the user is granted the requested permission
 */
export function checkPrivilege(
    permission: Permission,
    accessEnvelope: AccessEnvelope | undefined,
    resourceId: string | undefined, 
    userUid: string | undefined
) {
    // console.log("checkPrivilege", {
    //     permission,
    //     accessEnvelope,
    //     resourceId,
    //     userUid
    // })
    if (
        !accessEnvelope ||
        accessEnvelope.resourceId !== resourceId || 
        !accessEnvelope.payload ||
        !userUid
    ) {
        return false;
    }

    const role = getRole(accessEnvelope, resourceId, userUid);
    
    if (!role) {
        return false;
    }

    return PRIVILEGES[role].has(permission);

}


export function doDeckAccessLoaded(lerni: LerniApp, action: PayloadAction<AccessEnvelope>) {
    lerni.deckAccess = action.payload;
}

interface AccessUnsubscribeData {
    resourceId: string;
    unsubscribe: Unsubscribe;
}

let unsubscribeData: AccessUnsubscribeData | null = null;

export function subscribeAccess(dispatch: AppDispatch, resourceId: string)  {

    if (unsubscribeData?.resourceId === resourceId) {
        // Already subscribed
        return;
    }

    const db = getFirestore(firebaseApp);
    const accessRef = collection(db, ACCESS);
    const q = query(accessRef, where(documentId(), "==", resourceId));
    const unsubscribe = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach( change => {
            switch (change.type) {
                case 'added':
                case 'modified':
                    const payload = change.doc.data() as Access;
                    const envelope: AccessEnvelope = {
                        resourceId,
                        payload
                    }
                    dispatch(deckAccessLoaded(envelope));
                    break;
            }
        })
    })

    unsubscribeData = {
        resourceId,
        unsubscribe
    }
}


export function getRole(accessEnvelope: AccessEnvelope, resourceId: string | undefined, userUid: string | undefined) : Role | undefined {
    const access = accessEnvelope.payload;
    if (
        !access ||
        !resourceId ||
        !userUid ||
        resourceId !== accessEnvelope.resourceId
    ) {
        return undefined;
    }
    if (userUid === access.owner) {
        return OWNER;
    }

    const generalRole = access.general;
    if (generalRole) {
        return generalRole;
    }

    const idRole = access.collaborators[userUid];
    if (idRole) {
        return idRole.role;
    }

    return undefined;
}

export async function getAccess(dispatch: AppDispatch, resourceId: string, withUser?: string) {
    const db = getFirestore(firebaseApp);
    const ref = doc(db, ACCESS, resourceId);
    const envelope = createAccessEnvelope(resourceId);
    try {
        const accessDoc = await getDoc(ref);
    
        if (accessDoc.exists()) {
            envelope.payload = accessDoc.data() as Access;
            subscribeAccess(dispatch, resourceId);
        } else {
            envelope.error = NOT_FOUND;
        }

    } catch (error) {
        
        if (error instanceof Error) {
            const message = error.message;
            if (message.indexOf("insufficient permissions") >=0) {
                envelope.error = ACCESS_DENIED;
            }
        } else {
            envelope.error = UNKNOWN_ERROR;
        }
    }
    if (envelope.error && withUser) {
        envelope.withUser = withUser;
    }
    return envelope;

}

export function createAccessEnvelope(resourceId: string) {
    const result: AccessEnvelope = {resourceId};
    return result;
}

export function doAccessSet(lerni: LerniApp, action: PayloadAction<AccessEnvelope>) {
    lerni.deckAccess = action.payload;
}

export function selectDeckAccessEnvelope(state: RootState) {
    return state.lerni.deckAccess;
}

export function unsubscribeAccess() {
    if (unsubscribeData) {
        unsubscribeData.unsubscribe();
        unsubscribeData = null;
    }
}

export async function enableGeneralViewer(resourceId: string) {

    const db = getFirestore(firebaseApp);
    const accessRef = doc(db, ACCESS, resourceId);

    return runTransaction(db, async txn => {
        const accessDoc = await txn.get(accessRef);
        if (!accessDoc.exists()) {
            throw new Error("access document not found for resource: " + resourceId);
        }

        const accessData = accessDoc.data() as Access;
        if (!accessData.general) {
            updateDoc(accessRef, AccessField.general, VIEWER);
        }
    })
}

export async function updateAcccess(resourceId: string, generalRole: Role | undefined) {

    const db = getFirestore(firebaseApp);
    const accessRef = doc(db, ACCESS, resourceId);
    const value = generalRole || deleteField();
    updateDoc(accessRef, AccessField.general, value);

}

/**
 * Create an `AccessRequest` object suitable for persisting in Firestore
 * @param resourceId The resource for which access is being requested
 * @param requester The identity of the user requesting access
 */
function createAccessRequest(resourceId: string, requester: Identity, message?: string) {
    const result: ProtoAccessRequest = {
        id: generateUid(),
        createdAt: serverTimestamp(),
        resourceId,
        requester
    }

    if (message) {
        result.message = message;
    }

    return result;
}

function createAccessResponse(resourceId: string, accepted: boolean, message?: string) {
    const result: ProtoAccessResponse = {
        id: generateUid(),
        createdAt: serverTimestamp(),
        resourceId,
        accepted
    }
    if (message) {
        result.message = message
    }
    return result;
}

export async function persistAccessResponse(requesterUid: string, resourceId: string, accepted: boolean, message?: string) {

    const response = createAccessResponse(resourceId, accepted, message);
    
    const db = getFirestore(firebaseApp);
    const libRef = doc(db, LIBRARIES, requesterUid);
    const notifications = {
        [response.id] : response
    }
    const data = { notifications }

    await updateDoc(libRef, data);
}


export async function persistAccessRequest(ownerUid: string, resourceId: string, requester: Identity, message?: string) {
    const request = createAccessRequest(resourceId, requester, message);

    const db = getFirestore(firebaseApp);
    const libRef = doc(db, LIBRARIES, ownerUid);

    const notifications = {
        [request.id] : request
    }

    const data = { notifications }

    await updateDoc(libRef, data);
}

/**
 * Inject a list of collaborators with specific roles into
 * a given Access document
 * @param ownerUid The `uid` of the user who owns the resource
 * @param resourceId The `id` of the resource whose access document is being updated
 * @param list The list of collaborators to be inject
 */
export async function injectCollaborators(resourceId: string, list: IdentityRole[]) {

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, ACCESS, resourceId);

    const collaborators: Record<string, IdentityRole> = {};

    const failures: Identity[] = [];

    for (const e of list) {
        
        const libRef = doc(db, LIBRARIES, e.identity.uid);

        const path = new FieldPath("resources", resourceId);
        try {
            await updateDoc(libRef, path, true); 
            collaborators[e.identity.uid] = e;           
        } catch (error) {
            failures.push(e.identity);
        
        }
    }

    if (!isEmpty(collaborators)) {
        await updateDoc(docRef, {collaborators})
    }

    return failures;
}

export async function changeCollaboratorRole(resourceId: string, identityRole: IdentityRole) {


    const db = getFirestore(firebaseApp);

    const libRef = doc(db, LIBRARIES, identityRole.identity.uid);
    const path = new FieldPath("resources", resourceId);

    const batch = writeBatch(db);
    batch.update(libRef, path, true);

    const accessPath = new FieldPath("collaborators", identityRole.identity.uid)
    const accessRef = doc(db, ACCESS, resourceId);
    batch.update(accessRef, accessPath, identityRole);

    await batch.commit();
}

export async function removeAcess(resourceId: string, identityRole: IdentityRole) {
    
    const db = getFirestore(firebaseApp);

    const libRef = doc(db, LIBRARIES, identityRole.identity.uid);
    const libPath = new FieldPath("resources", resourceId);

    const batch = writeBatch(db);
    batch.update(libRef, libPath, deleteField());

    const accessPath = new FieldPath("collaborators", identityRole.identity.uid)
    const accessRef = doc(db, ACCESS, resourceId);
    batch.update(accessRef, accessPath, deleteField());

    await batch.commit();
}

export function createIdentityRole(identity: Identity, role: Role) : IdentityRole {
    return {
        identity,
        role
    }
}