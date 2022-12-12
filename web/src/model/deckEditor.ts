import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { displayError } from "./errorHandler";
import { ClientFlashcard, Deck, DeckEditor, LerniApp } from "./types";

export function doDeckeditorMount(lerni: LerniApp, action: PayloadAction<string>) {
    lerni.deckEditor = {
        deckId: action.payload,
        bootstrap: {cardCount: 0}
    };
}

export function doDeckeditorUnmount(lerni: LerniApp, action: PayloadAction) {
    lerni.deckEditor = {}
    lerni.cards = {}
    delete lerni.deck;
}

export function doDeckeditorNewActiveCardDelete(lerni: LerniApp, action: PayloadAction) {
    if (lerni.deckEditor) {
        delete lerni.deckEditor.newActiveCard;
    }
}

export function deckEditorReceiveAddedDeck(lerni: LerniApp, deckEditor: DeckEditor, deckId: string) {
    const bootstrap = deckEditor.bootstrap;
    if (bootstrap) {
        bootstrap.deckId = deckId;
        const deck = lerni.deck;
        if (deck) {
            if (deck.cards.length === bootstrap.cardCount) {
                endBootstrap(deck, deckEditor);
            }
        }
    }
}

export function deckEditorReceiveRemovedCard(lerni: LerniApp, deckEditor: DeckEditor, cardId: string) {
    const cardRemove = deckEditor.cardRemove;
    if (!cardRemove) {
        displayError(
            lerni,
            "Oops! Something went wrong.",
            "ERROR:deckEditorReceiveRemovedCard: `cardRemove` is not defined"
        )
    } else {
        endCardRemove(lerni, deckEditor, cardId, cardRemove.oldDeck)
    }
}

/**
 * Handle a newly added Flashcard. There are two use cases:
 * 1. We are receiving cards during the DeckEditor bootstrap process
 * 2. The user clicked the [Add Flashcard] button in the editor
 */
export function deckEditorReceiveAddedCard(lerni: LerniApp, card: ClientFlashcard) {
    const deckEditor = lerni.deckEditor;
    if (deckEditor) {
        const deck = lerni.deck;
        const bootstrap = deckEditor.bootstrap;
        if (bootstrap) {
            bootstrap.cardCount++;
            if (deck && bootstrap.deckId && deck.cards.length===bootstrap.cardCount) {
                endBootstrap(deck, deckEditor);
            }
        } else {
            const cardAdd = deckEditor.cardAdd || (
                deckEditor.cardAdd = {}
            )
            cardAdd.cardId = card.id;
            if (cardAdd.deckId) {
                endCardAdd(deckEditor, card.id);
            }
        }
    }
}

function endCardAdd(deckEditor: DeckEditor, cardId: string) {
    delete deckEditor.cardAdd;
    deckEditor.activeCard = cardId;
    deckEditor.newActiveCard = true;
}

function endBootstrap(deck: Deck, deckEditor: DeckEditor) {
    const deckCards = deck.cards;
    if (deckCards.length>0) {
        const first = deckCards[0];
        deckEditor.activeCard = first.id;
        deckEditor.newActiveCard = true;
    }
    delete deckEditor.bootstrap;
}

export function deckEditorReceiveModifiedDeck(lerni: LerniApp, oldDeck: Deck | undefined, newDeck: Deck) {

    const deckEditor = lerni.deckEditor;
    if (deckEditor) {

        if (!oldDeck) {
            displayError(
                lerni,
                "Oops! Something went wrong",
                "deckEditorReceiveModifiedDeck: expected `oldDeck` to be defined"
            )
        } else {
            // There are two broad cases to consider:
            // 1. The deck `name` was modified
            // 2. The deck `cards` array was modified

            if (oldDeck.name !== newDeck.name) {
                // The deck `name` was modified
                // Do nothing
            } else {
                // The deck `cards` array was modified

                const oldCards = oldDeck.cards;
                const newCards = newDeck.cards;

                if (oldCards.length === newCards.length) {
                    // This is unexpected. Don't alert the user, but log a warning.
                    console.log("WARNING:deckEditorReceiveModifiedDeck: expected `oldCards.length != newCards.length`")
                } else if (oldCards.length > newCards.length) {
                    // A card was removed
                    deckEditor.cardRemove = {oldDeck}
                } else {
                    // A card was added
                    const cardAdd = deckEditor.cardAdd || (
                        deckEditor.cardAdd = {}
                    )
                    cardAdd.deckId = newDeck.id;
                    const cardId = cardAdd.cardId;
                    if (cardId) {
                        endCardAdd(deckEditor, cardId);
                    }
                }
            }
        }
    }
}

function endCardRemove(lerni: LerniApp, deckEditor: DeckEditor, cardId :string, oldDeck: Deck ) {
    delete deckEditor.cardRemove;

    const oldCards = oldDeck.cards;
    for (let i=0; i<oldCards.length; i++) {
        const ref = oldCards[i];
        if (ref.id === cardId) {
            const nextIndex = i+1;
            if (nextIndex < oldCards.length) {
                const nextRef = oldCards[nextIndex];
                deckEditor.activeCard = nextRef.id;
                deckEditor.newActiveCard = true;
                return;
            }
            const prevIndex = i-1;
            if (prevIndex>=0 && oldCards.length>0) {
                const prevRef = oldCards[prevIndex];
                deckEditor.activeCard = prevRef.id;
                deckEditor.newActiveCard = true;
                return;
            }
            break;
        }
    }

    const deck = lerni.deck;
    if (deck) {
        const newCards = deck.cards;
        if (newCards.length === 0) {
            delete deckEditor.activeCard;
        } else {
            // In theory we should never get here.
            // But just in case...

            const first = newCards[0];
            deckEditor.activeCard = first.id;
            deckEditor.newActiveCard = true;
        }
    }
}


export function selectNewActiveCard(state: RootState) {
    const lerni = state.lerni;
    const deckEditor = lerni.deckEditor;
    if (deckEditor) {
        const activeCard = deckEditor.activeCard;
        if (deckEditor.newActiveCard && activeCard) {
            const cardInfo = lerni.cards[activeCard];
            if (cardInfo) {
                return cardInfo.card;
            }
        }
    }
    return null;
}