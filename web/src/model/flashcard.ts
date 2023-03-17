import { Cache, EntityApi, getEntity } from "@gmcfall/react-firebase-state";
import { doc, getFirestore, runTransaction } from "firebase/firestore";
import { NextRouter } from "next/router";
import generateUid from "../util/uid";
import { deleteYjsData } from "../yjs/FirestoreProvider";
import { alertError } from "./alert";
import { deckPath } from "./deck";
import firebaseApp from "./firebaseApp";
import { CARDS, DeckField, DECKS } from "./firestoreConstants";
import { deckEditRoute } from "./routes";
import { CardRef, Deck, EditorProvider, FLASHCARD } from "./types";


export async function deleteFlashcard(deckId: string, cardId: string, ep?: EditorProvider) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deckId);

    await runTransaction(db, async txn => {
        const deckDoc = await txn.get(deckRef);
        if (deckDoc.exists()) {
            const deck = deckDoc.data() as Deck;
            const cardList = [...deck.cards];
            for (let i=0; i<cardList.length; i++) {
                const ref = cardList[i];
                if (ref.id === cardId) {
                    cardList.splice(i, 1);
                    txn.update(deckRef, DeckField.cards, cardList);
                    break;
                }
            }
        }
    })

    if (ep) {
        await ep.provider.deleteYjsData();
    } else {
        await deleteYjsData(firebaseApp, [DECKS, deckId, CARDS, cardId])
    }

}

export function createFlashcardRef(cardId: string) : CardRef {
    return {
        type: FLASHCARD,
        id: cardId
    }
}

async function saveFlashcard(deckId: string, cardId: string) {

    const db = getFirestore(firebaseApp);

    return runTransaction(db, async txn => {

        const deckRef = doc(db, DECKS, deckId);
        const deckDoc = await txn.get(deckRef);

        if (!deckDoc.exists()) {
            throw new Error(`Deck(${deckId}) does not exist`)
        }

        const cardRef = createFlashcardRef(cardId);

        const deckData = deckDoc.data();
        const cardList = [...deckData.cards, cardRef];

        txn.update(deckRef, DeckField.cards, cardList);

        return cardList.length-1;
    })

}

export async function addFlashcard(api: EntityApi, router: NextRouter, deckId: string) {

    try {
        const cardId = generateUid();
        const cardIndex = await saveFlashcard(deckId, cardId);
        // We want to navigate to the new card, but there may
        // be some latency in the update to the deck and hence the navigation
        // could fail if the new card is not included in the local instance of the
        // deck during the next render. To address this issue, we update the
        // deck instance in the local cache now
        api.mutate((cache: Cache) => {
            const [deck] = getEntity<Deck>(cache, deckPath(deckId));
            if (deck) {
                const cards = deck.cards;
                if (cards.length === cardIndex) {
                    const cardRef = createFlashcardRef(cardId);
                    cards.push(cardRef);
                }
            }
        })

        const newRoute = deckEditRoute(deckId, cardIndex);
        router.push(newRoute);
    } catch (error) {
        alertError(api, "An error occurred while saving the new Flashcard")
    }
}