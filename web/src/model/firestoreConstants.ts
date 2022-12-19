
/** The "decks" collection in Firestore */
export const DECKS = 'decks';

/** The "libraries" collection in Firestore */
export const LIBRARIES = 'libraries';

/** The "access" collection in Firestore */
export const ACCESS = "access";

/** The "cards" collection in Firestore */
export const CARDS = "cards";

/** The "metadata" collection in Firestore */
export const METADATA = "metadata";

/** The "tags" collection in Firestore */
export const TAGS = "tags";

/** The "search" collection in Firestore */
export const SEARCH = "search";

/** The "identities" collection in Firestore */
export const IDENTITIES = "identities";

/** Field names used when updating documents in the 'libraries' collection */
export const LibraryField = {
    resources: 'resources'
}

/** Field names used when updating documents in the 'decks' collection */
export const DeckField = {
    resources: 'resources',
    name: 'name',
    cards: 'cards',
    isPublished: "isPublished"
}

/** Field names used when updating documents in the 'cards' collection */
export const CardField = {
    content: 'content'
}

/** Field names used when updating documents in the 'metadata' collection */
export const MetadataField = {
    name: 'name'
}

/** Field names used when updating documents in the 'search' collection */
export const SearchField = {
    resources: "resources"
}

export const AccessField = {
    general: "general"
}
