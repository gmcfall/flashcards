// This file provides features that span multiple parts of the app

import { PayloadAction } from "@reduxjs/toolkit";
import { deleteField, doc, FieldPath, getFirestore, onSnapshot, setDoc, Unsubscribe, updateDoc, writeBatch } from "firebase/firestore";
import deckReceive from "../store/actions/deckReceive";
import { AppDispatch, RootState } from "../store/store";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { DECKS, DECK_ACCESS, LIBRARIES, LibraryField } from "./firestoreConstants";
import { DECK, Deck, DeckAccess, DeckApp, ResourceRef, UNTITLED_DECK } from "./types";

export function createDeck() : Deck {

    return {
        id: generateUid(),
        name: UNTITLED_DECK,
        cards: {},
        sequence: []
    }
}

/**
 * Create a DeckAccess object
 * @param owner The uid of the User that owns the Deck
 */
function createDeckAccess(owner: string) : DeckAccess {
    return {owner}
}

export async function saveDeck(userUid: string, deck: Deck) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deck.id);
    const deckPromise = setDoc(deckRef, deck);

    const deckAccess = createDeckAccess(userUid);
    const accessRef = doc(db, DECK_ACCESS, deck.id);
    const accessPromise = setDoc(accessRef, deckAccess);

    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deck.id);
    const deckResourceRef: ResourceRef = {
        id: deck.id,
        type: DECK,
        name: deck.name
    }
    const libPromise = updateDoc(libRef, path, deckResourceRef)

    return Promise.all([deckPromise, accessPromise, libPromise])
}


let unsubscribe: Unsubscribe | null = null;
let subscribedDeck: string | null = null;
export function deckSubscribe(dispatch: AppDispatch, deckId: string) {

    if (subscribedDeck === deckId) {
        // Already subscribed
        return;
    }
    if (unsubscribe) {
        unsubscribe();
    }
    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deckId);
    
    unsubscribe = onSnapshot(deckRef, (document) => {
        if (document.exists()) {
            const data = document.data() as Deck;
            dispatch(deckReceive(data));
        }
    })
}

export function deckUnsubscribe() {
    if (unsubscribe) {
        unsubscribe();
        subscribedDeck=null;
        unsubscribe=null;
    }
}

export function doDeckReceive(editor: DeckApp, action: PayloadAction<Deck>) {
    editor.deck = action.payload;
}

export function doDeckNameUpdate(editor: DeckApp, action: PayloadAction<string>) {
    const deck = editor.deck;
    if (deck) {
        deck.name = action.payload;
    }
}

/** Select the current deck being edited or viewed */
export function selectDeck(state: RootState) {
    return state.editor.deck;
}

export async function deleteDeck(deckId: string, userUid: string) {
    const db = getFirestore(firebaseApp);

    const deckRef = doc(db, DECKS, deckId);
    const deckAccessRef = doc(db, DECK_ACCESS, deckId);
    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deckId);

    const batch = writeBatch(db);

    batch.delete(deckRef);
    batch.delete(deckAccessRef);
    batch.update(libRef, path, deleteField());

    await batch.commit();
}