// This file provides features that span multiple parts of the app

import { PayloadAction } from "@reduxjs/toolkit";
import { collection, deleteField, doc, documentId, FieldPath, getFirestore, onSnapshot, query, runTransaction, setDoc, Unsubscribe, where, writeBatch } from "firebase/firestore";
import deckAdded from "../store/actions/deckAdded";
import deckModified from "../store/actions/deckModified";
import { AppDispatch, RootState } from "../store/store";
import generateUid from "../util/uid";
import { deckEditorReceiveAddedDeck, deckEditorReceiveModifiedDeck } from "./deckEditor";
import firebaseApp from "./firebaseApp";
import { CARDS, DECKS, ACCESS, LIBRARIES, LibraryField } from "./firestoreConstants";
import { subscribeCard } from "./flashcard";
import { DECK, Deck, DeckAccess, Flashcard, LerniApp, ResourceRef, UNTITLED_DECK } from "./types";

export function createDeck() : Deck {

    return {
        id: generateUid(),
        name: UNTITLED_DECK,
        cards: []
    }
}

/**
 * Create a DeckAccess object
 * @param owner The uid of the User that owns the Deck
 */
function createDeckAccess(owner: string) : DeckAccess {
    return {owner}
}

export async function saveDeck(userUid: string, deck: Deck, card: Flashcard) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deck.id);

    const deckAccess = createDeckAccess(userUid);
    const accessRef = doc(db, ACCESS, deck.id);
    const cardRef = doc(db, CARDS, card.id);
    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deck.id);
    const deckResourceRef: ResourceRef = {
        type: DECK,
        id: deck.id,
        name: deck.name
    }

    const batch = writeBatch(db);
    batch.set(accessRef, deckAccess);
    batch.set(deckRef, deck);
    batch.update(libRef, path, deckResourceRef);

    await batch.commit();

    // We cannot save the `cardRef` in the batch because the security rules rely on
    // the existence of the `deckAccess` record. Therefore, we do it now, outside the batch.

    setDoc(cardRef, card);
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
    subscribedDeck = deckId;
    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deckId);
    const decksRef = collection(db, DECKS);

    const q = query(decksRef, where(documentId(), "==", deckId));
    unsubscribe = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach(change => {
            switch (change.type) {
                case 'added' : {
                    const data = change.doc.data() as Deck;
                    dispatch(deckAdded(data));
                    subscribeAllCards(dispatch, data);
                    break;
                }
                case 'modified' : {
                    const data = change.doc.data() as Deck;
                    dispatch(deckModified(data));
                    subscribeAllCards(dispatch, data);
                    break;
                }
            }
        })
    })

    
    unsubscribe = onSnapshot(deckRef, (document) => {
        if (document.exists()) {
            const data = document.data() as Deck;
            dispatch(deckAdded(data));
            subscribeAllCards(dispatch, data);
        }
    })
}

function subscribeAllCards(dispatch: AppDispatch, deck: Deck) {
    deck.cards.forEach(cardRef => subscribeCard(dispatch, cardRef.id))
}

export function deckUnsubscribe() {
    if (unsubscribe) {
        unsubscribe();
        subscribedDeck=null;
        unsubscribe=null;
    }
}

export function doDeckModified(lerni: LerniApp, action: PayloadAction<Deck>) {
    const newDeck = action.payload;
    // The deck may have been modified for two reasons:
    // 1. To update the `name`
    // 2. To update the `cards` array.

    const oldDeck = lerni.deck;
    lerni.deck = newDeck;
    deckEditorReceiveModifiedDeck(lerni, oldDeck, newDeck);
}

export function doDeckAdded(lerni: LerniApp, action: PayloadAction<Deck>) {
    const deck = action.payload;
    lerni.deck = deck;
    if (lerni.deckEditor) {
        deckEditorReceiveAddedDeck(lerni, lerni.deckEditor, deck.id);
    }
}

export function doDeckNameUpdate(lerni: LerniApp, action: PayloadAction<string>) {
    const deck = lerni.deck;
    if (deck) {
        deck.name = action.payload;
    }
}

/** Select the current deck being edited or viewed */
export function selectDeck(state: RootState) {
    return state.lerni.deck;
}

export async function deleteDeck(deckId: string, userUid: string) {
    const db = getFirestore(firebaseApp);

    const deckRef = doc(db, DECKS, deckId);
    const deckAccessRef = doc(db, ACCESS, deckId);
    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deckId);

    return runTransaction(db, async txn => {
        const deckDoc = await txn.get(deckRef);
        if (deckDoc.exists()) {
            const deckData = deckDoc.data() as Deck;
            
            deckData.cards.forEach(card => {
                const cardRef = doc(db, CARDS, card.id);
                txn.delete(cardRef)
            })
            txn.delete(deckRef);
            txn.delete(deckAccessRef);
            txn.update(libRef, path, deleteField())
        }
    })
}