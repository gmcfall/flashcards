// This file provides features that span multiple parts of the app

import { EntityApi } from "@gmcfall/react-firebase-state";
import {
    collection, deleteField, doc, FieldPath, Firestore, getDoc, getDocs, getFirestore, query, runTransaction, updateDoc, where, writeBatch
} from "firebase/firestore";
import { NextRouter } from "next/router";
import porterStem from "../util/stemmer";
import { STOP_WORDS } from "../util/stopWords";
import generateUid from "../util/uid";
import { removeYdoc } from "../yjs/FirestoreProvider";
import { enableGeneralViewer } from "./access";
import { alertError, alertInfo } from "./alert";
import firebaseApp from "./firebaseApp";
import { ACCESS, CARDS, DeckField, DECKS, LIBRARIES, LibraryField, METADATA, SEARCH, SearchField, TAGS } from "./firestoreConstants";
import { createFlashcardRef } from "./flashcard";
import { createMetadata } from "./metadata";
import { deckEditRoute } from "./routes";
import { Access, DECK, Deck, JSONContent, Metadata, ResourceRef, ResourceSearchServerData, SessionUser, Tags, TiptapMap, UNTITLED_DECK } from "./types";

export function createDeck() : Deck {

    return {
        id: generateUid(),
        name: UNTITLED_DECK,
        cards: [],
        isPublished: false
    }
}

export async function addDeck(api: EntityApi, router: NextRouter, user: SessionUser) {
    try {
        const deck = createDeck();
        const cardId = generateUid();
        const cardRef = createFlashcardRef(cardId);
        deck.cards.push(cardRef);

        await saveDeck(user.uid, deck);

        router.push(deckEditRoute(deck.id));
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

export function getCardList(deck: Deck, entityProviders: TiptapMap) {
    const list: JSONContent[] = [];
    for (const cardRef of deck.cards) {
        const ep = entityProviders[cardRef.id];
        if (ep) {
            const json = ep.editor.getJSON();
            list.push(json);
        }
    }
    return list;
}

// TODO: move this to a Firebase function
export async function publishDeck(
    api:EntityApi, 
    deckId: string, 
    deckName: string, 
    cardList: JSONContent[]
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
            txn.set(tagsRef, newTagsData);
            if (!tagsDoc.exists()) {
                return [[], newTagsData.tags]
            } else {
                const oldTagsData = tagsDoc.data() as Tags;
                return computeSearchDelta(oldTagsData.tags, newTagsData.tags);
            }
        })
        
        console.log('publishDeck', tags, add, remove)
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
    const deckRef = doc(db, DECKS, deckId);
    try {
        await updateDoc(deckRef, {
            [DeckField.isPublished]: value
        })
    } catch (error) {
        console.error("updateIsPublishedFlag failed", error);
        throw error;
    }
}

async function removeSearchResources(db: Firestore, resourceId: string, tags: string[]) {
    for (const tag of tags) {
        const docRef = doc(db, SEARCH, tag);
        const path = new FieldPath(SearchField.resources, resourceId);
        try {
            await runTransaction(db, async txn => {
                const searchDoc = await txn.get(docRef);
                if (!searchDoc.exists()) {
                    // Do nothing
                } else {
                    txn.update(docRef, path, deleteField());
                }
            })
        } catch (error) {
            console.error("removeSearchResources failed", error);
            throw error;
        }
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

    try {
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
    } catch (error) {
        console.error('addSearchResources failed', error);
        throw error;
    }
}


function getDeckTags(deckName: string, cards: JSONContent[]) {
    const set = new Set<string>();
    addTextTags(set, deckName);

    cards.forEach(content => {
        addTicTapContentTags(set, content);
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

export async function saveDeck(userUid: string, deck: Deck) {

    const db = getFirestore(firebaseApp);
    const deckRef = doc(db, DECKS, deck.id);

    const metadata = createMetadata(deck.id, DECK, userUid, deck.name);
    const metadataRef = doc(db, METADATA, deck.id);

    const deckAccess = createDeckAccess(userUid);
    const accessRef = doc(db, ACCESS, deck.id);
    const libRef = doc(db, LIBRARIES, userUid);
    const path = new FieldPath(LibraryField.resources, deck.id);

    const batch = writeBatch(db);
    batch.set(accessRef, deckAccess);
    batch.set(metadataRef, metadata);
    batch.set(deckRef, deck);
    batch.update(libRef, path, true);

    await batch.commit();
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
            
            txn.delete(deckRef);
            txn.delete(deckAccessRef);
            txn.delete(metadataRef);
            if (updateLibrary) {
                txn.update(libRef, path, deleteField())
            }
            return deckData.cards;
        }
        return null;
    }).then(
        async (cardList) => {
            const cardPromises = [];
            if (cardList) {
                for (const ref of cardList) {
                    const cardId = ref.id;
                    cardPromises.push(
                        removeYdoc(firebaseApp, [DECKS, deckId, CARDS, cardId])
                    );
                }
            }
            await Promise.all(cardPromises);
        }
    )
    promiseList.push(lastPromise);
    return Promise.all(promiseList);
}

export function deckPath(deckId: string | undefined) {
    return [DECKS, deckId];
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

export async function setDeckWriter(api: EntityApi, deckId: string, writer: string) {
    const db = getFirestore(api.firebaseApp);

    const deckRef = doc(db, DECKS, deckId);
    try {
        await updateDoc(deckRef, {writer});
    } catch (error) {
        alertError(api, "An error occurred while loading the deck", new Error(
            "Failed to set deck writer", {cause: error}
        ));
    }
}

export async function removeDeckWriter(api: EntityApi, deckId: string) {
    const db = getFirestore(api.firebaseApp);
    const deckRef = doc(db, DECKS, deckId);
    try {
        await updateDoc(deckRef, {writer: deleteField()});
    } catch (error) {
        alertError(api, "An error occurred while closing the deck", new Error(
            "Failed to remove deck writer", {cause: error}
        ));
    }
}
