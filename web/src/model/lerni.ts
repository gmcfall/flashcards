import { deckUnsubscribe } from "./deck";
import { unsubscribeAllCards } from "./flashcard";
import { libraryUnsubscribe } from "./library";

export function unsubscribeLerni() {
    libraryUnsubscribe();
    deckUnsubscribe();
    unsubscribeAllCards();
}