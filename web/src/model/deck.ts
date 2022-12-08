// This file provides features that span multiple parts of the app

import { PayloadAction } from "@reduxjs/toolkit";
import { deleteField, doc, FieldPath, getFirestore, onSnapshot, runTransaction, setDoc, Unsubscribe, updateDoc } from "firebase/firestore";
import deckReceive from "../store/actions/deckReceive";
import { AppDispatch, RootState } from "../store/store";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { CARDS, DECKS, DECK_ACCESS, LIBRARIES, LibraryField } from "./firestoreConstants";
import { subscribeCard } from "./flashcard";
import { DECK, Deck, DeckAccess, LerniApp, ResourceRef, UNTITLED_DECK } from "./types";

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

export function doDeckReceive(lerni: LerniApp, action: PayloadAction<Deck>) {
    const deck = action.payload;
    lerni.deck = deck;
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
    const deckAccessRef = doc(db, DECK_ACCESS, deckId);
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