import { createAction } from '@reduxjs/toolkit'
import { Deck, Flashcard } from '../../model/types'
import generateUid from '../../util/uid'
import { AppDispatch, RootState } from '../store'
import firebaseApp from '../../model/firebaseApp'
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { DECKS } from '../../model/firestoreConstants'

const newDeckAction = createAction<Deck>("deck/new");

export default function deckNew() {
    return (state: RootState, dispatch: AppDispatch) => {
        const deck = createNewDeck();
        const action = newDeckAction(deck);

        saveDeck(deck);
        dispatch(action);
    }
}

function saveDeck(deck: Deck) {
    const db = getFirestore(firebaseApp);
    const ref = doc(db, DECKS, deck.id);
    setDoc(ref, deck);
}

function createNewDeck() : Deck {
    const card = createNewFlashcard();

    return {
        id: generateUid(),
        name: "Untitled Deck",
        cards: {
            [card.id]: card
        },
        sequence: [card.id]
    }
}

function createNewFlashcard() : Flashcard {
    return {
        id: generateUid(),
        content: ''
    }
}