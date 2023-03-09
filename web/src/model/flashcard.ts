import { Cache, DocChangeEvent, DocRemovedEvent, EntityApi, getEntity } from "@gmcfall/react-firebase-state";
import { JSONContent } from "@tiptap/core";
import { doc, getFirestore, runTransaction } from "firebase/firestore";
import { NextRouter } from "next/router";
import { findUndefined, jsonClone } from "../util/common";
import generateUid from "../util/uid";
import { alertError } from "./alert";
import { hasCardWriter, stopCardWriter } from "./CardWriter";
import { deckPath } from "./deck";
import firebaseApp from "./firebaseApp";
import { CARDS, DeckField, DECKS } from "./firestoreConstants";
import { deckEditRoute } from "./routes";
import { CardRef, ClientFlashcard, Deck, FLASHCARD, ServerFlashcard } from "./types";

export function updateFlashcardContent(api: EntityApi, cardId: string, content: JSONContent) {
    const path = cardPath(cardId);
    api.mutate((cache: Cache) => {
        const [card] = getEntity<ClientFlashcard>(cache, path);
        if (card) {
            card.content = content
        } else {
            console.warn("Cannot update flashcard content. Card not found: " + cardId);
        }
    })
}

export function deleteFlashcardByIndex(api: EntityApi, deckId: string, cardIndex: number) {
    const [deck] = getEntity<Deck>(api, deckPath(deckId));
    if (deck) {
        const cards = deck.cards;
        if (cardIndex<cards.length) {
            const cardRef = cards[cardIndex];
            deleteFlashcard(deckId, cardRef.id);
        }
    }
}

async function deleteFlashcard(deckId: string, cardId: string) {

    const db = getFirestore(firebaseApp);
    const cardRef = doc(db, CARDS, cardId);
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
        txn.delete(cardRef);
    })

}

export function flashcardRoomName(cardId: string) {
    return "flashcard-" + cardId;
}

export function createServerFlashCard(access: string) : ServerFlashcard {

    return {
        type: FLASHCARD,
        id: generateUid(),
        access,
        content: '{"type": "doc", "content": []}'
    }
}


export function createFlashcardRef(cardId: string) : CardRef {
    return {
        type: FLASHCARD,
        id: cardId
    }
}

async function saveFlashcard(card: ServerFlashcard) {

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

        return cardList.length-1;
    })

}

export async function addFlashcard(api: EntityApi, router: NextRouter, deckId: string) {

    try {
        const card = createServerFlashCard(deckId);
        const cardIndex = await saveFlashcard(card);
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
                    const cardRef = createFlashcardRef(card.id);
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

export function cardPath(cardId: string | undefined) {
    return [CARDS, cardId];
}

export function createCardTransform(deckId: string) {
    return (event: DocChangeEvent<ServerFlashcard>) => {
        const path = event.path;
        const serverCard = event.data;
        if (hasCardWriter(serverCard.id)) {
            // The 
            const api = event.api;
            const clientCard = getEntity<ClientFlashcard>(api, path);
            if (clientCard) {
                return clientCard;
            }
        }
        const result: ClientFlashcard = {
            type: FLASHCARD,
            id: path[1],
            access: deckId,
            content: JSON.parse(serverCard.content)
        }
        return result;
    };
}

export function handleCardRemoved(event: DocRemovedEvent<ServerFlashcard>) {
    const card = event.data;
    stopCardWriter(card.id);
}