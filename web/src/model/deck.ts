// This file provides features that span multiple parts of the app

import { PayloadAction } from "@reduxjs/toolkit";
import {
    collection, deleteField, doc, documentId, FieldPath, Firestore, getDoc, getFirestore, onSnapshot, query, runTransaction,
    setDoc, Unsubscribe, where, writeBatch
} from "firebase/firestore";
import deckAdded from "../store/actions/deckAdded";
import deckModified from "../store/actions/deckModified";
import { AppDispatch, RootState } from "../store/store";
import porterStem from "../util/stemmer";
import { STOP_WORDS } from "../util/stopWords";
import generateUid from "../util/uid";
import { setAlert } from "./alert";
import { deckEditorReceiveAddedDeck, deckEditorReceiveModifiedDeck } from "./deckEditor";
import firebaseApp from "./firebaseApp";
import { ACCESS, CARDS, DECKS, LIBRARIES, LibraryField, METADATA, SEARCH, SearchField, TAGS } from "./firestoreConstants";
import { subscribeCard } from "./flashcard";
import { createMetadata } from "./metadata";
import { DECK, Deck, DeckAccess, INFO, JSONContent, LerniApp, ResourceSearchServerData, ServerFlashcard, Tags, UNTITLED_DECK, ResourceRef } from "./types";

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
    return {
        owner,
        public: []
    }
}

export function doDeckPublishFulfilled(lerni: LerniApp, action: PayloadAction) {
    setAlert(lerni, {
        severity: INFO,
        message: "The deck has been published"
    })
}

// TODO: move this to a Firebase function
export async function publishDeck(lerni: LerniApp) {

    const deck = lerni.deck;
    if (deck) {
        const tags = getDeckTags(lerni);
        const db = getFirestore(firebaseApp);
        const tagsRef = doc(db, TAGS, deck.id);
        const newTagsData: Tags = {
            tags
        };

        const [remove, add] = await runTransaction(db, async txn => {
            const tagsDoc = await txn.get(tagsRef);
            if (!tagsDoc.exists()) {
                txn.set(tagsRef, newTagsData);
                return [[], newTagsData.tags]
            } else { 
                const oldTagsData = tagsDoc.data() as Tags;
                return computeSearchDelta(oldTagsData.tags, newTagsData.tags);
            }
        })
        const ref: ResourceRef = {
            type: DECK,
            id: deck.id,
            name: deck.name
        }
        addSearchResources(db, ref, add);
        removeSearchResources(db, deck.id, remove);
    }
}

async function removeSearchResources(db: Firestore, resourceId: string, tags: string[]) {
    for (const tag of tags) {
        const docRef = doc(db, SEARCH, tag);
        const path = new FieldPath(SearchField.resources, resourceId);
        await runTransaction(db, async txn => {
            const searchDoc = await txn.get(docRef);
            if (!searchDoc.exists()) {
                // Do nothing
            } else {
                txn.update(docRef, path, deleteField());
            }
        })
    }
}

function computeSearchDelta(oldTags: string[], newTags: string[]) {
    const oldSet = new Set<string>(Array.from(oldTags));
    const newSet = new Set<string>(Array.from(newTags));

    const remove: string[] = [];
    const add: string[] = [];

    for (let tag of oldSet) {
        if (!newSet.has(tag)) {
            remove.push(tag);
        }
    }
    for (let tag of newSet) {
        if (!oldSet.has(tag)) {
            add.push(tag);
        }
    }
    return [remove, add];
}


async function addSearchResources(db: Firestore, resourceRef: ResourceRef, tags: string[]) {

    for (const tag of tags) {
        const docRef = doc(db, SEARCH, tag);
        const path = new FieldPath(SearchField.resources, resourceRef.id);
        await runTransaction(db, async txn => {
            const searchDoc = await txn.get(docRef);
            if (!searchDoc.exists()) {
                const searchData: ResourceSearchServerData = {
                    resources: {
                        [resourceRef.id]: resourceRef
                    }
                }
                txn.set(docRef, searchData);
            } else {
                txn.update(docRef, path, resourceRef);
            }
        })
    }
}


function getDeckTags(lerni: LerniApp) {
    const set = new Set<string>();
    const deck = lerni.deck;
    if (deck) {
        addTextTags(set, deck.name);
    }
    const cards = lerni.cards;
    for (const cardId in cards) {
        const card = cards[cardId].card;
        addTicTapContentTags(set, card.content);
    }

    return Array.from(set);
}

function addTicTapContentTags(set: Set<string>, content: JSONContent) {
    if (content.text) {
        addTextTags(set, content.text);
    } if (content.content) {
        const childContent = content.content;
        if (Array.isArray(childContent)) {
            const array = childContent;
            array.forEach(e => addTicTapContentTags(set, e));
        } else {
            addTicTapContentTags(set, content.content);
        }
    }
}

function addTextTags(set: Set<string>, name: string) {
    const parts = name.split(" ");
    parts.forEach(word => addTag(set, word));
}

function addTag(set: Set<string>, word: string) {
    if (word) {
        const lower = word.toLocaleLowerCase();
        if (!STOP_WORDS.has(lower)) {
            const stem = porterStem(lower);
            set.add(stem);
        }
    }
}

export async function saveDeck(userUid: string, deck: Deck, card: ServerFlashcard) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deck.id);

    const metadata = createMetadata(DECK, userUid, deck.name);
    const metadataRef = doc(db, METADATA, deck.id);

    const deckAccess = createDeckAccess(userUid);
    const accessRef = doc(db, ACCESS, deck.id);
    const cardRef = doc(db, CARDS, card.id);
    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deck.id);

    const batch = writeBatch(db);
    batch.set(accessRef, deckAccess);
    batch.set(metadataRef, metadata);
    batch.set(deckRef, deck);
    batch.update(libRef, path, true);

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
    subscribedDeck = deckId;
    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deckId);
    const decksRef = collection(db, DECKS);

    const q = query(decksRef, where(documentId(), "==", deckId));
    unsubscribe = onSnapshot(q, snapshot => {
        snapshot.docChanges().forEach(change => {
            switch (change.type) {
                case 'added' : {
                    const data = change.doc.data() as Deck;
                    dispatch(deckAdded(data));
                    subscribeAllCards(dispatch, data);
                    break;
                }
                case 'modified' : {
                    const data = change.doc.data() as Deck;
                    dispatch(deckModified(data));
                    subscribeAllCards(dispatch, data);
                    break;
                }
            }
        })
    })

    
    unsubscribe = onSnapshot(deckRef, (document) => {
        if (document.exists()) {
            const data = document.data() as Deck;
            dispatch(deckAdded(data));
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

export function doDeckModified(lerni: LerniApp, action: PayloadAction<Deck>) {
    const newDeck = action.payload;
    // The deck may have been modified for two reasons:
    // 1. To update the `name`
    // 2. To update the `cards` array.

    const oldDeck = lerni.deck;
    lerni.deck = newDeck;
    deckEditorReceiveModifiedDeck(lerni, oldDeck, newDeck);
}

export function doDeckAdded(lerni: LerniApp, action: PayloadAction<Deck>) {
    const deck = action.payload;
    lerni.deck = deck;
    if (lerni.deckEditor) {
        deckEditorReceiveAddedDeck(lerni, lerni.deckEditor, deck.id);
    }
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
    const metadataRef = doc(db, METADATA, deckId);
    const deckAccessRef = doc(db, ACCESS, deckId);
    const libRef = doc(db, LIBRARIES, userUid);
    const tagsRef = doc(db, TAGS, deckId);
    const path = new FieldPath(LibraryField.resources, deckId);

    const tagsDoc = await getDoc(tagsRef);
    const promiseList: Promise<any>[] = [];
    if (tagsDoc.exists()) {
        const tagsData = tagsDoc.data() as Tags;
        const tagList = tagsData.tags;
        const promise = removeSearchResources(db, deckId, tagList);
        promiseList.push(promise);
    }

    const lastPromise = runTransaction(db, async txn => {
        const deckDoc = await txn.get(deckRef);
        if (deckDoc.exists()) {
            const deckData = deckDoc.data() as Deck;
            
            deckData.cards.forEach(card => {
                const cardRef = doc(db, CARDS, card.id);
                txn.delete(cardRef)
            })
            txn.delete(deckRef);
            txn.delete(deckAccessRef);
            txn.delete(metadataRef);
            txn.update(libRef, path, deleteField())
        }
    })
    promiseList.push(lastPromise);
    return Promise.all(promiseList);
}
