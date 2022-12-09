import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { collection, doc, documentId, getFirestore, onSnapshot, query, runTransaction, Unsubscribe, updateDoc, where } from "firebase/firestore";
import flashcardReceive from "../store/actions/flashcardReceive";
import { RootState } from "../store/store";
import generateUid from "../util/uid";
import firebaseApp from "./firebaseApp";
import { CardField, CARDS, DeckField, DECKS } from "./firestoreConstants";
import { CardRef, Flashcard, LerniApp, FLASHCARD } from "./types";

export function doFlashcardSelect(lerni: LerniApp, action: PayloadAction<string>) {
    lerni.deckEditor.activeCard = action.payload;
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

export function selectActiveCard(state: RootState) {
    return getActiveCardId(state.lerni);
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
                console.log('saveFlashcardContent', content)
                const db = getFirestore(firebaseApp);
                const cardRef = doc(db, CARDS, card.id);
                await updateDoc(cardRef, CardField.content, content);
            }
        }
    }
    return true;
}

function getActiveCardId(lerni: LerniApp) {
    const id = lerni.deckEditor.activeCard;
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

export function doFlashcardReceive(lerni: LerniApp, action: PayloadAction<Flashcard>) {
    const card = action.payload;

    const cards = lerni.cards;
    const info = cards[card.id];
    if (info) {
        // If the received card is the active card, then the local content is more 
        // up-to-date than the received content. Hence, we overwrite the received
        // content with the local content.
        const activeId = getActiveCardId(lerni);
        if (activeId === card.id) {
            card.content = info.card.content;
        }
        info.card = card;
        
    } else {
        cards[card.id] = {
            card
        }
    }

    const deck = lerni.deck;
    const deckEditor = lerni.deckEditor;
    if (deck && !deckEditor.activeCard && deck) {

        const list = deck.cards;
        if (list.length>0) {
            const firstCardRef = list[0];
            if (firstCardRef.id === card.id) {
                // The currently received card is the first card. Make it active!
                deckEditor.activeCard = card.id;
                deckEditor.newActiveCard = true;
            } else {
                // The currently received card is NOT the first card.
                // If the first card was received earlier make it active now.
                const firstCardInfo = lerni.cards[firstCardRef.id];
                if (firstCardInfo) {
                    deckEditor.activeCard = firstCardInfo.card.id;
                    deckEditor.newActiveCard = true;
                }
            }
        }
    }
    console.log('doFlashcardReceive', JSON.parse(JSON.stringify(lerni)))
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

        const deckRef = doc(db, DECKS, card.ownerDeck);
        const cardDocRef = doc(db, CARDS, card.id);
        const deckDoc = await txn.get(deckRef);

        if (!deckDoc.exists()) {
            throw new Error(`Deck(${card.ownerDeck}) does not exist`)
        }

        const cardRef = createFlashcardRef(card.id);

        const deckData = deckDoc.data();
        const cardList = [...deckData.cards, cardRef];

        txn.update(deckRef, DeckField.cards, cardList);
        txn.set(cardDocRef, card);
    })

}