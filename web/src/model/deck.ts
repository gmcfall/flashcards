// This file provides features that span multiple parts of the app

import { doc, FieldPath, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { DECKS, LIBRARIES, RESOURCES } from "./firestoreConstants";
import { DECK, Deck, ResourceRef, UNTITLED_DECK } from "./types";

export function createDeck() : Deck {

    return {
        id: generateUid(),
        name: UNTITLED_DECK,
        cards: {},
        sequence: []
    }
}

export async function saveDeck(userUid: string, deck: Deck) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deck.id);
    const deckPromise = setDoc(deckRef, deck);

    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(RESOURCES, deck.id);
    const deckResourceRef: ResourceRef = {
        id: deck.id,
        type: DECK,
        name: deck.name
    }
    const libPromise = updateDoc(libRef, path, deckResourceRef)

    return Promise.all([deckPromise, libPromise])


}