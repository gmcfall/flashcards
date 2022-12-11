import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { collection, doc, documentId, getFirestore, onSnapshot, query, runTransaction, Unsubscribe, updateDoc, where, writeBatch } from "firebase/firestore";
import flashcardAdded from "../store/actions/flashcardAdded";
import flashcardModified from "../store/actions/flashcardModified";
import flashcardRemoved from "../store/actions/flashcardRemoved";
import { RootState } from "../store/store";
import generateUid from "../util/uid";
import { deckEditorReceiveAddedCard } from "./deckEditor";
import firebaseApp from "./firebaseApp";
import { CardField, CARDS, DeckField, DECKS } from "./firestoreConstants";
import { CardRef, Deck, Flashcard, FLASHCARD, LerniApp } from "./types";

export function doFlashcardSelect(lerni: LerniApp, action: PayloadAction<string>) {
    if (lerni.deckEditor) {
        lerni.deckEditor.activeCard = action.payload;
    }
}

export function doFlashcardContentUpdate(lerni: LerniApp, action: PayloadAction<string>) {

    const activeId = getActiveCardId(lerni);
    if (activeId) {
        const cardInfo = lerni.cards[activeId];
        if (cardInfo) {
            cardInfo.card.content = action.payload;
        }
    }
}

export function doFlashcardRemoved(lerni: LerniApp, action: PayloadAction<string>) {
    const cardId = action.payload;
    delete lerni.cards[cardId];
    if (lerni.deckEditor) {
        
    }
}

export async function deleteFlashcard(deck: Deck, cardId: string) {

    let updateDeck = true;
    const cardList = [...deck.cards];
    for (let i=0; i<cardList.length; i++) {
        const ref = cardList[i];
        if (ref.id === cardId) {
            cardList.splice(i, 1);
            updateDeck = true;
            break;
        }
    }

    const db = getFirestore(firebaseApp);
    const cardRef = doc(db, CARDS, cardId);
    const deckRef = doc(db, DECKS, deck.id);

    const batch = writeBatch(db);
    if (updateDeck) {
        batch.update(deckRef, DeckField.cards, cardList);
    }
    batch.delete(cardRef);
    await batch.commit();

}

export function doFlashcardAddFulfilled(lerni: LerniApp, action: PayloadAction<string>) {
    if (lerni.deckEditor) {
        lerni.deckEditor.activeCard = action.payload;
    }
}

export function selectActiveCard(state: RootState) {
    return getActiveCardId(state.lerni);
}

export function selectCards(state: RootState) {
    return state.lerni.cards;
}

export function createFlashCard(access: string) : Flashcard {

    return {
        type: FLASHCARD,
        id: generateUid(),
        access,
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
            const data = change.doc.data() as Flashcard;
            switch (change.type) {
                case 'added' :
                    dispatch(flashcardAdded(data));
                    break;

                case 'modified':
                    dispatch(flashcardModified(data));
                    break;

                case 'removed':
                    dispatch(flashcardRemoved(data.id));
                    break;
            }
        })
    })

    unsubscribeFunctions[cardId] = unsubscribe;
}

let lastSavedId = '';
let lastSavedContent = '';
export async function saveFlashcardContent(lerni: LerniApp, activeIdArg: string | null) {
    
    const activeId = activeIdArg || getActiveCardId(lerni);
    const cards = lerni.cards;
    if (activeId) {
        const cardInfo = cards[activeId];
        if (cardInfo) {
            const card = cardInfo.card;
            const content = card.content;
            if (lastSavedId !== card.id || lastSavedContent !== content) {
                lastSavedId = card.id;
                lastSavedContent = content;
                const db = getFirestore(firebaseApp);
                const cardRef = doc(db, CARDS, card.id);
                await updateDoc(cardRef, CardField.content, content);
            }
        }
    }
    return true;
}

function getActiveCardId(lerni: LerniApp) {
    const id = lerni.deckEditor ? lerni.deckEditor.activeCard : null;
    if (id) {
        // Verify that the card exists
        if (!lerni.cards[id]) {
            return null;
        }
    }
    return id;
}

export function unsubscribeAllCards() {
    for (const key in unsubscribeFunctions) {
        const unsubscribe = unsubscribeFunctions[key];
        unsubscribe();
        delete unsubscribeFunctions[key];
    }
}

/**
 * Handle a newly added Flashcard.
 */
export function doFlashcardAdded(lerni: LerniApp, action: PayloadAction<Flashcard>) {
    const card = action.payload;
    lerni.cards[card.id] = {card};

    deckEditorReceiveAddedCard(lerni, card);
}

export function doFlashcardModified(lerni: LerniApp, action: PayloadAction<Flashcard>) {
    const card = action.payload;
    lerni.cards[card.id] = {card};
}

export function createFlashcardRef(cardId: string) : CardRef {
    return {
        type: FLASHCARD,
        id: cardId
    }
}


export async function saveFlashcard(card: Flashcard) {

    const db = getFirestore(firebaseApp);

    return runTransaction(db, async txn => {

        const deckRef = doc(db, DECKS, card.access);
        const cardDocRef = doc(db, CARDS, card.id);
        const deckDoc = await txn.get(deckRef);

        if (!deckDoc.exists()) {
            throw new Error(`Deck(${card.access}) does not exist`)
        }

        const cardRef = createFlashcardRef(card.id);

        const deckData = deckDoc.data();
        const cardList = [...deckData.cards, cardRef];

        txn.update(deckRef, DeckField.cards, cardList);
        txn.set(cardDocRef, card);
    })

}