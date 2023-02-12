import { deleteField, doc, FieldPath, getFirestore, runTransaction, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import EntityApi from "../fbase/EntityApi";
import LeaseeApi from "../fbase/LeaseeApi";
import { isEmpty } from "../util/common";
import generateUid from "../util/uid";
import { alertError } from "./alert";
import firebaseApp from "./firebaseApp";
import { ACCESS, AccessField, LIBRARIES } from "./firestoreConstants";
import { Access, AccessTuple, ClientAccess, EDIT, GLOBE, Identity, IdentityRole, LOCK_CLOSED, LOCK_OPEN, OWNER, Permission, ProtoAccessRequest, ProtoAccessResponse, Role, SHARE, VIEW, VIEWER } from "./types";

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
    accessTuple: AccessTuple,
    resourceId: string | undefined, 
    userUid: string | undefined
) {

    const [,access] = accessTuple;
    if (
        !access ||
        access.resourceId !== resourceId || 
        !userUid
    ) {
        return false;
    }

    const role = getRole(access, userUid);
    
    if (!role) {
        return false;
    }

    return PRIVILEGES[role].has(permission);

}

export function getRole(access: ClientAccess | undefined, userUid: string | undefined) : Role | undefined {
    if (
        !access ||
        !userUid
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


export function getSharingIconType(accessTuple: AccessTuple) {
    const [, access] = accessTuple;
    if (access) {
        return (
           (access.general && GLOBE) ||
           (isEmpty(access.collaborators) && LOCK_CLOSED) ||
           LOCK_OPEN
        )
    }
    return LOCK_CLOSED
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

export async function updateGeneralRole(api: EntityApi, resourceId: string, generalRole?: Role) {

    try {
        const db = getFirestore(api.getClient().firebaseApp);
        const accessRef = doc(db, ACCESS, resourceId);
        const value = generalRole || deleteField();
        await updateDoc(accessRef, AccessField.general, value);
    } catch (error) {
        alertError(api, "An error occurred while saving the sharing settings", error);
    }

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

export function accessPath(resourceId?: string) {
    return [ACCESS, resourceId];
}

function accessTransform(api: LeaseeApi, access: Access, path: string[]) : ClientAccess {
    return {
        ...access,
        resourceId: path[1]
    }
}

export const accessOptions = {
    transform: accessTransform
}

export function resourceNotFound(tuple: AccessTuple) {
    const [,,error] = tuple;
    return Boolean(error && error.message.includes("Missing or insufficient permissions"));
}