import { getAuth } from "@firebase/auth";
import { doc, getFirestore, updateDoc } from "@firebase/firestore";
import { EntityApi, getEntity } from "@gmcfall/react-firebase-state";
import { alertError } from "./alert";
import { deckPath } from "./deck";
import { CardField, CARDS } from "./firestoreConstants";
import { cardPath } from "./flashcard";
import { ClientFlashcard, Deck } from "./types";


export default class CardWriter {

    /** The number of milliseconds between write events for a given card */
    writeInterval = 5000; // 5 seconds

    /** 
     * A map whose key is the `id` for a Flashcard, and whose value is the 
     * last saved content for that card.
     */
    private contentMap: Record<string, string | undefined> = {};
    private intervalId?: ReturnType<typeof setInterval>;
    

    start(api: EntityApi) {
        if (this.intervalId) {
            return;
        }
        const firebaseApp = api.firebaseApp;
        const self = this;
        this.intervalId = setInterval(() => {
            const auth = getAuth(firebaseApp);
            const user = auth.currentUser;
            if (user) {
                for (const cardId in self.contentMap) {
                    const [card] = getEntity<ClientFlashcard>(api, cardPath(cardId));
                    if (card) {
                        const [deck] = getEntity<Deck>(api, deckPath(card.access));
                        if (deck && deck.writer === user.uid) {
                            const lastSavedContent = self.contentMap[card.id];
                            if (lastSavedContent) {
                                const content = JSON.stringify(card.content);
                                if (content !== lastSavedContent) {
                                    self.contentMap[card.id] = content;
    
                                    const db = getFirestore(api.firebaseApp);
                                    const cardRef = doc(db, CARDS, cardId);
                                    updateDoc(cardRef, CardField.content, content).catch(
                                        error => alertError(api, 
                                            "An error occurred while saving changes to a flashcard", 
                                            error, {deckId: deck.id, cardId: cardId}
                                    ))
                                }
                            }
                        }
                    }
                }
            }
        }, this.writeInterval)
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            delete this.intervalId;
            this.contentMap = {};
        }
    }

    addCard(card: ClientFlashcard) {
        this.contentMap[card.id] = JSON.stringify(card.content);
    }

    removeCard(cardId: string) {
        delete this.contentMap[cardId];
    }

    hasCard(cardId: string) {
        return Boolean(this.contentMap[cardId]);
    }
}

const instance = new CardWriter();

export function startCardWriter(api: EntityApi, card: ClientFlashcard) {
    instance.start(api);
    instance.addCard(card);
}

export function stopCardWriter(cardId: string) {
    instance.removeCard(cardId);
}
export function closeCardWriter() {
    instance.stop();
}

export function hasCardWriter(cardId: string) {
    return instance.hasCard(cardId);
}