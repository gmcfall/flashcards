
export function deckEditRoute(deckId: string, cardIndex?: number) {

    return cardIndex===undefined ? 
        `/decks/${deckId}/edit` :
        `/decks/${deckId}/edit/${cardIndex}`;
}

export function deckViewRoute(deckId: string) {
    return `/decks/${deckId}/view`;
}

export function libraryRoute() {
    return "/library";
}