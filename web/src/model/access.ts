import { PayloadAction } from "@reduxjs/toolkit";
import { collection, deleteField, doc, documentId, getFirestore, onSnapshot, query, runTransaction, Unsubscribe, updateDoc, where } from "firebase/firestore";
import deckAccessLoaded from "../store/actions/deckAccessLoaded";
import { AppDispatch } from "../store/store";
import firebaseApp from "./firebaseApp";
import { ACCESS, AccessField } from "./firestoreConstants";
import { Access, AccessEnvelope, LerniApp, Role, VIEWER } from "./types";

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