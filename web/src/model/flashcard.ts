import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { collection, doc, documentId, getFirestore, onSnapshot, query, runTransaction, Unsubscribe, where } from "firebase/firestore";
import flashcardReceive from "../store/actions/flashcardReceive";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { CARDS, DeckField, DECKS } from "./firestoreConstants";
import { CardRef, ClientFlashcard, LerniApp, FLASHCARD, ServerFlashcard } from "./types";

export function createFlashCard(ownerDeck: string) : ServerFlashcard {

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
                    dispatch(flashcardReceive(change.doc.data() as ServerFlashcard));
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

export function doFlashcardReceive(lerni: LerniApp, action: PayloadAction<ServerFlashcard>) {
    const serverCard = action.payload;
    const clientCard = toClientFlashcard(serverCard);

    const cards = lerni.cards;
    const info = cards[clientCard.id];
    if (info) {
        info.data = clientCard;
    } else {
        cards[clientCard.id] = {
            data: clientCard
        }
    }
}


function toClientFlashcard(serverCard: ServerFlashcard) {
    return serverCard as ClientFlashcard;
}

export async function saveFlashcard(card: ServerFlashcard) {

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