// This file provides features that span multiple parts of the app

import {
    collection, deleteField, doc, FieldPath, Firestore, getDoc, getDocs, getFirestore, query, runTransaction,
    setDoc, updateDoc, where, writeBatch
} from "firebase/firestore";
import { NavigateFunction } from "react-router-dom";
import EntityApi from "../fbase/EntityApi";
import { getEntity, watchEntity } from "../fbase/functions";
import LeaseeApi from "../fbase/LeaseeApi";
import porterStem from "../util/stemmer";
import { STOP_WORDS } from "../util/stopWords";
import generateUid from "../util/uid";
import { enableGeneralViewer } from "./access";
import { alertError, alertInfo } from "./alert";
import firebaseApp from "./firebaseApp";
import { ACCESS, CARDS, DeckField, DECKS, LIBRARIES, LibraryField, METADATA, SEARCH, SearchField, TAGS } from "./firestoreConstants";
import { cardPath, createCardTransform, createFlashcardRef, createServerFlashCard } from "./flashcard";
import { createMetadata } from "./metadata";
import { deckEditRoute } from "./routes";
import { Access, ClientFlashcard, DECK, Deck, JSONContent, Metadata, ResourceRef, ResourceSearchServerData, ServerFlashcard, SessionUser, Tags, UNTITLED_DECK } from "./types";

export function createDeck() : Deck {

    return {
        id: generateUid(),
        name: UNTITLED_DECK,
        cards: [],
        isPublished: false
    }
}

export async function addDeck(api: EntityApi, navigate: NavigateFunction, user: SessionUser) {
    try {
        const deck = createDeck();
        const card = createServerFlashCard(deck.id);
        const cardRef = createFlashcardRef(card.id);
        deck.cards.push(cardRef);

        await saveDeck(user.uid, deck, card);

        navigate(deckEditRoute(deck.id));
    } catch (error) {
        alertError(api, "An error occurred while saving the new Deck", error);
    }
}

/**
 * Create a DeckAccess object
 * @param owner The uid of the User that owns the Deck
 */
function createDeckAccess(owner: string) : Access {
    return {
        owner,
        collaborators: {}
    }
}

export function getCardList(api: EntityApi, deck: Deck) {
    const list: ClientFlashcard[] = [];
    for (const cardRef of deck.cards) {
        const path = cardPath(cardRef.id);
        const [, card, error] = getEntity<ClientFlashcard>(api, path);
        if (error) {
            return null;
        }
        if (!card) {
            return null;
        }
        list.push(card);
    }
    return list;
}

// TODO: move this to a Firebase function
export async function publishDeck(
    api:EntityApi, 
    deckId: string, 
    deckName: string, 
    cardList: ClientFlashcard[]
) {

    try {
        const tags = getDeckTags(deckName, cardList);
        const db = getFirestore(firebaseApp);
        const tagsRef = doc(db, TAGS, deckId);
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
            id: deckId,
            name: deckName
        }
    
        await Promise.all([
            addSearchResources(db, ref, add),
            removeSearchResources(db, deckId, remove),
            updateIsPublishedFlag(db, deckId, true),
            enableGeneralViewer(deckId)
        ])
    
        alertInfo(api, "The deck has been published");
    } catch (error) {
        alertError(api, "An error occurred while publishing the deck", error);
    }

        
}


async function updateIsPublishedFlag(db: Firestore, deckId: string, value: boolean) {
    const deckRef = doc(db, DECK, deckId);
    await updateDoc(deckRef, {
        [DeckField.isPublished]: value
    })
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


function getDeckTags(deckName: string, cards: ClientFlashcard[]) {
    const set = new Set<string>();
    addTextTags(set, deckName);

    cards.forEach(card => {
        addTicTapContentTags(set, card.content);
    })

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

    const metadata = createMetadata(deck.id, DECK, userUid, deck.name);
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

export async function deleteOwnedDecks(userUid: string) {
    const db = getFirestore(firebaseApp);
    const metaRef = collection(db, METADATA);
    const q = query(metaRef, where("owner", "==", userUid));
    const snapshot = await getDocs(q);
    const promiseList: Promise<any>[] = [];
    snapshot.forEach(doc => {
        const metadata = doc.data() as Metadata;
        const deckId = metadata.id;

        const promise = deleteDeck(deckId, userUid, false);
        promiseList.push(promise);
    })

    return Promise.all(promiseList);
}

export async function deleteDeckWithErrorAlert(api: EntityApi, deckId: string, userUid: string) {
    try {
        await deleteDeck(deckId, userUid, true);
    } catch (error) {
        alertError(api, "An error occurred while deleting the deck", error);
    }
}


export async function deleteDeck(deckId: string, userUid: string, updateLibrary: boolean) {
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
            if (updateLibrary) {
                txn.update(libRef, path, deleteField())
            }
        }
    })
    promiseList.push(lastPromise);
    return Promise.all(promiseList);
}

export function deckPath(deckId: string | undefined) {
    return [DECKS, deckId];
}

function deckTransform(api: LeaseeApi, deck: Deck, path: string[]) {
    const cards = deck.cards;
    const client = api.getClient();
    const leasee = api.leasee;

    const options = {
        transform: createCardTransform(deck.id)
    }

    cards.forEach(cardRef => {
        const path = cardPath(cardRef.id);
        watchEntity(client, leasee, path, options);
    })

    return deck;
}

export const DECK_LISTENER_OPTIONS = {
    transform: deckTransform
}

export async function updateDeckName(api: EntityApi, deckId: string, name: string) {

    try {
        const db = getFirestore(firebaseApp);
    
        const deckRef = doc(db, DECKS, deckId);
        const metaRef = doc(db, METADATA, deckId);
    
        const nameRecord = {name};
    
        const batch = writeBatch(db);
        batch.update(deckRef, nameRecord);
        batch.update(metaRef, nameRecord);
    
        await batch.commit();
    } catch (error) {
        alertError(api, "An error occurred while saving the deck name", error);
    }
    

  
}
