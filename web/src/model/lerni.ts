import { getClientState, TypedClientStateGetter } from "../fbase/functions";
import { deckUnsubscribe } from "./deck";
import { unsubscribeAllCards } from "./flashcard";
import { libraryUnsubscribe } from "./library";
import { LerniApp } from "./types";

export function unsubscribeLerni() {
    libraryUnsubscribe();
    deckUnsubscribe();
    unsubscribeAllCards();
}

export const appGetState: TypedClientStateGetter<LerniApp> = getClientState;