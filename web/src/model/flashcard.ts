import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { collection, doc, documentId, getFirestore, onSnapshot, query, runTransaction, Unsubscribe, where } from "firebase/firestore";
import flashcardReceive from "../store/actions/flashcardReceive";
import { RootState } from "../store/store";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { CARDS, DeckField, DECKS } from "./firestoreConstants";
import { CardRef, Flashcard, LerniApp, FLASHCARD } from "./types";

export function doFlashcardSelect(lerni: LerniApp, action: PayloadAction<string>) {
    lerni.deckEditor.activeCard = action.payload;
}

export function doFlashcardContentUpdate(lerni: LerniApp, action: PayloadAction<string>) {

    const activeId = lerni.deckEditor.activeCard;
    if (activeId) {
        const cardInfo = lerni.cards[activeId];
        if (cardInfo) {
            cardInfo.card.content = action.payload;
        }
    }
}

export function selectActiveCard(state: RootState) {
    return state.lerni.deckEditor.activeCard;
}

export function selectCards(state: RootState) {
    return state.lerni.cards;
}

export function createFlashCard(ownerDeck: string) : Flashcard {

    return {
        type: FLASHCARD,
        id: generateUid(),
        ownerDeck,
        content: ''
    }
}

const unsubscribeFunctions: Record<string, Unsubscribe> = {}

export function subscribeCard(dispatch: Dispatch, cardId: string) {
    if (unsubscribeFunctions[cardId]) {
        // We are already subscribed
        return;
    }

    const db = getFirestore(firebaseApp);
    const cardsRef = collection(db, CARDS);
    const q = query(cardsRef, where(documentId(), "==", cardId));
    const unsubscribe = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach( change => {
            switch (change.type) {
                case 'added' :
                case 'modified':
                    dispatch(flashcardReceive(change.doc.data() as Flashcard));
                    break;
            }
        })
    })

    unsubscribeFunctions[cardId] = unsubscribe;

}

export function unsubscribeAllCards() {
    for (const key in unsubscribeFunctions) {
        const unsubscribe = unsubscribeFunctions[key];
        unsubscribe();
        delete unsubscribeFunctions[key];
    }
}

export function doFlashcardReceive(lerni: LerniApp, action: PayloadAction<Flashcard>) {
    const card = action.payload;

    const cards = lerni.cards;
    const info = cards[card.id];
    if (info) {
        info.card = card;
    } else {
        cards[card.id] = {
            card
        }
    }
}


export async function saveFlashcard(card: Flashcard) {

    const db = getFirestore(firebaseApp);

    return runTransaction(db, async txn => {

        const deckRef = doc(db, DECKS, card.ownerDeck);
        const cardDocRef = doc(db, CARDS, card.id);
        const deckDoc = await txn.get(deckRef);

        if (!deckDoc.exists()) {
            throw new Error(`Deck(${card.ownerDeck}) does not exist`)
        }

        const cardRef: CardRef = {
            type: FLASHCARD,
            id: card.id
        }

        const deckData = deckDoc.data();
        const cardList = [...deckData.cards, cardRef];

        txn.update(deckRef, DeckField.cards, cardList);
        txn.set(cardDocRef, card);
    })

}