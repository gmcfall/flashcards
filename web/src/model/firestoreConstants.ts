
/** The "decks" collection in Firestore */
export const DECKS = 'decks';

/** The "libraries" collection in Firestore */
export const LIBRARIES = 'libraries';

/** The "deck_access" collection in Firestore */
export const DECK_ACCESS = "deck_access";

/** The "cards" collection in Firestore */
export const CARDS = "cards";

/** Field names used when updating documents in the 'libraries' collection */
export const LibraryField = {
    resources: 'resources'
}

/** Field names used when updating documents in the 'decks' collection */
export const DeckField = {
    resources: 'resources',
    name: 'name',
    cards: 'cards'
}
