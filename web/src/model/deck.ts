// This file provides features that span multiple parts of the app

import { PayloadAction } from "@reduxjs/toolkit";
import { deleteField, doc, FieldPath, getFirestore, onSnapshot, runTransaction, setDoc, Unsubscribe, writeBatch } from "firebase/firestore";
import deckReceive from "../store/actions/deckReceive";
import { AppDispatch, RootState } from "../store/store";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { CARDS, DECKS, DECK_ACCESS, LIBRARIES, LibraryField } from "./firestoreConstants";
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
    const accessRef = doc(db, DECK_ACCESS, deck.id);
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

export function doDeckeditorUnmount(lerni: LerniApp, action: PayloadAction) {
    lerni.deckEditor = {}
    lerni.cards = {}
    delete lerni.deck;
}

export function doDeckeditorNewActiveCardDelete(lerni: LerniApp, action: PayloadAction) {
    console.log('doDeckeditorNewActiveCardDelete', JSON.parse(JSON.stringify(lerni)));
    delete lerni.deckEditor.newActiveCard;
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

export function selectNewActiveCard(state: RootState) {
    const lerni = state.lerni;
    const deckEditor = lerni.deckEditor;
    const activeCard = deckEditor.activeCard;
    if (deckEditor.newActiveCard && activeCard) {
        const cardInfo = lerni.cards[activeCard];
        if (cardInfo) {
            return cardInfo.card;
        }
    }
    return null;
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