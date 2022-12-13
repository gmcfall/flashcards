
import {JSONContent} from "@tiptap/core";

export type {JSONContent} from "@tiptap/core";

/**
 * A record that specifies the type of markup that should be
 * applied to some text, such as "bold" or "italic"
 */
export interface TipTapMark {
    type: string;
}

/** The TipTap 'doc' content type */
export const DOC = 'doc';

/** The TipTap 'text' content type */
export const TEXT='text';

/** The TipTap 'paragraph' content type */
export const PARAGRAPH='paragraph';

/** The TipTap 'orderedList' content type */
export const ORDERED_LIST='orderedList';

/** The TipTap 'bulletList' content type */
export const BULLET_LIST='bulletList';

/** The TipTap 'bold' mark type */
export const BOLD='bold';

/** The TipTap 'italic' mark type */
export const ITALIC='italic';

export type FlashCardType = 'flashcard';
/** The "flashcard" value of the FlashCardType */
export const FLASHCARD = 'flashcard';

export interface FlashcardBase {    
    type: FlashCardType,

    /** An identifier for the card */
    id: string,

    /** The id of the deck that owns this card */
    access: string,
}

export interface ServerFlashcard extends FlashcardBase {

    /** The card content represented as an HTML string */
    content: string,
}

export interface ClientFlashcard extends FlashcardBase {
    /** The card content represented as a JSON object */
    content: JSONContent;
}


export interface NamedUser {
    /** The `uid` value of the user as defined by Firebase Auth */
    uid: string;

    /** 
     * The user's display name, which may be the person's real name
     * or an alias.
     */
    displayName: string;
}

/**
 * A ClientFlashcard plus additional information related to the card.
 */
export interface CardInfo {
    card: ClientFlashcard,

    /**
     * The user who is currently editing the card. For now, only one person
     * can edit a card at a time. If we support collaborative editing in the
     * future, this will change to an array of NamedUsers.
     */
    currentEditor?: NamedUser
}

/**
 * The type of a Card. 
 * For now, there is only one type, namely, "flashcard".
 * In the future, we anticipate other types.
 */
export type CardType = FlashCardType;

export interface CardRef {
    type: string,
    id: string
}

/**
 * Metadata about a given resource
 */
export interface Metadata {

    /** The type of resource */
    type: ResourceType,

    /** The uid of the User who owns this resource */
    owner: string;

    /** A friendly name for the resource suitable for display to users */
    name: string
}

export interface MetadataEnvelope {
    id: string,
    metadata: Metadata
}


/**
 * The universal interface for Deck objects. This interface is
 * used for Firebase documents and in the client.
 * 
 * Conceptually a deck contains a list of Flashcard resources.
 * The Deck holds the cards in a Record to facilitate lookup by id,
 * plus an array that lists the sequential order of the cards in the deck.
 */
export interface Deck {
    /** An identifier for this Deck */
    id: string,

    /** A friendly name for the Deck suitable for display */
    name: string,

    /** 
     * A list of references to cards within this Deck.
     */
    cards: CardRef[]
}

/**
 * The default name for a newly created deck
 */
export const UNTITLED_DECK="Untitled Deck";


/** 
 * A union of the various types of resources supported by the app.
 * For now, there is just one possible type of resource, namely a Deck.
 * The "unknown" type allows us to to stub-out the type while loading 
 * resource metadata.
 */
export type ResourceType = 'deck' | 'unknown';

/**
 * The 'unknown' value of ResourceType
 */
export const UNKNOWN_RESOURCE_TYPE = 'unknown';

/**
 * The 'deck' value of ResourceType
 */
export const DECK = 'deck';

export interface ResourceRef {
    
    /** The type of resource */
    type: ResourceType;

    /** An identifier for the resource */
    id: string;

    /** A name for the resource suitable for display */
    name: string
}

/**
 * A Library document in Firestore.
 * 
 * Firestore path: /libraries/{user.uid}
 */
export interface FirestoreLibrary {

    /** 
     * A map whose key is the `id` for a resource
     * and whose value is `true` indicating that the resource
     * is included in the library.  This representation makes it easy 
     * to add and remove resources from the library.
     */
    resources: Record<string, boolean>;
}

/**
 * A Firestore document that stores "tags" under which the document is indexed for searching.
 * 
 * Firestore path: /tags/{deck.id}
 * 
 * Each tag is the porter stem for a word from the deck name or the card contents.
 * Tags exclude pronouns, determiners, conjunctions, prepositions, units of measure
 */
export interface Tags {
    tags: string[];
}

/**
 * A Firestore document that stores all decks that contain a given tag.
 * 
 * Firestore path: /search/{tag}
 */

export interface Search {
    /** 
     * A map whose key is the id of a Deck and whose value is a boolean
     * specifying whether the deck contains the tag.
     */
    resources: Record<string, boolean>;
}

/**
 * A client-side representation of a user's library of resources.
 * In this representation, the map from the {@link FirestoreLibrary} is
 * converted to an array sorted alphabetically.
 */
export interface ClientLibrary {
    /** The list of `id` values for resources in the library */
    resources: string[];

    /** A map where the key is the `id` for a resource and the value is its metadata */
    metadata: Record<string, Metadata>;
}

export interface ErrorInfo {
    message: string;
    cause?: string
}


export type RegisterState =  'REGISTER_BEGIN' | 'REGISTER_EMAIL' | 'REGISTER_EMAIL_VERIFY';
/**
 * The state at the beginning of the registration workflow.
 * This is where the user must choose an identity provider.
 */
export const REGISTER_BEGIN = 'REGISTER_BEGIN';

/**
 * The state immediately after the user chooses to use the "password" identity
 * provider. At this point the form for entering the `email`, `password` and
 * `displayName` is rendered.
 */
export const REGISTER_EMAIL = 'REGISTER_EMAIL';

/**
 * The state immediately after the user submits the `email`, `password` and
 * `displayName`. At this point, the user is presented with a notice that
 * the verification email was sent.
 */
export const REGISTER_EMAIL_VERIFY = 'REGISTER_EMAIL_VERIFY';

export type SigninState = 'SIGNIN_BEGIN' | 'SIGNIN_PASSWORD';

/**
 * State indicating that the sign-in wizard should be displayed 
 * at the page which allows the user to choose an identity provider.
 */
export const SIGNIN_BEGIN = 'SIGNIN_BEGIN';

/**
 * State indicating the that the sign-in wizard should display
 * the form for collecting `email`, `password` and `displayName`.
 */
export const SIGNIN_PASSWORD = 'SIGNIN_PASSWORD';

/**
 * A representation of a User stored in the client-side Session.
 */
export interface SessionUser extends NamedUser {

    /**
     * The list of identity providers for the user.
     * Possible values include:
     * - google.com    (GoogleAuthProvider.PROVIDER_ID)
     * - facebook.com  (FacebookAuthProvider.PROVIDER_ID)
     * - twitter.com   (TwitterAuthProvider.PROVIDER_ID)
     * - password      (EmailAuthProvider.PROVIDER_ID)
     */
    providers: string[],

    /** 
     * A flag, which if true indicates that the user registered
     * with (email, password) credentials but has not yet verified
     * his or her email. 
     */
    requiresVerification?: boolean
}
export interface Session {
    user: SessionUser
}
/**
 * The default `displayName` for users
 */
export const ANONYMOUS = "Anonymous";

export interface RegisterEmailForm {
    email: string,
    password: string,
    displayName: string,
    invalidEmail: boolean,
    invalidPassword: boolean,
    invalidDisplayName: boolean
}

export interface RegisterEmailData {
    email: string,
    password: string,
    displayName: string
}

export interface PasswordCredentials {
    email: string,
    password: string
}

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export const ERROR = 'error';
export const WARNING = 'warning';
export const INFO = 'info';
export const SUCCESS = 'success';

export interface AlertData {
    severity: AlertSeverity,
    message: string
}



/** A role that determines permissions for accessing a Deck */
export type Role = 'editor' | 'viewer';

/** The 'editor' Role */
export const EDITOR="editor";

/** The 'viewer' Role */
export const VIEWER="viewer"

/**
 * A Firestore document that defines the access control rules for a given Deck
 * 
 * Firestore path: /access/{deck.id}
 */
export interface DeckAccess {
    /** The uid of the user who owns the Deck */
    owner: string;

    /** The roles for public access to the Deck */
    public: Role[];
}

/** The status of a loading process */
export type LoadStatus = 'pending' | 'failed';

/** The 'pending' value of the LoadStatus type*/
export const PENDING='pending';

/** The 'failed' value of the LoadStatus type */
export const FAILED='failed';


/**
 * Maintains state during the process of loading the initial
 * snapshot of a Deck and its cards.
 */
interface DeckBootstrap {

    /** The id of the deck received */
    deckId?: string;

    /** The number of cards received */
    cardCount: number;
}


/**
 * State used during the process of removing a card from the deck.
 */
export interface CardRemove {
    /** The Deck state before the Card was removed. */
    oldDeck: Deck; 
}

/**
 * State used during the process of adding a new card to the Deck
 * after the bootstrap process ends.
 * 
 * The `cardId` field is set when the Firestore listener receives and "added" Flashcard.
 * The `deckId` field is set when the Firestore listener receives a "modified" Deck
 * containing a reference to the added card.
 * 
 * When both fields are set, the `activeCard` is updated and the CardAdd record
 * is deleted from `lerni.deckEditor`
 */
export interface CardAdd {

    /** The id of the Flashcard that was added */
    cardId?: string;

    /** The id of the Deck that was modified reference the added card */
    deckId?: string;
}

export interface DeckEditor {

    /** The id of the deck being edited */
    deckId?: string;

    /**
     * The id of the "active" card, i.e. the one currently
     * loaded into the rich text editor.
     */
    activeCard?: string;

    /**
     * A flag indicating that the `activeCard` was newly changed by an asynchronous process. 
     * If this flag is present, ZEditor will set the card content into the TipTap editor and 
     * then dispatch an action to delete the flag.
     */
    newActiveCard?: boolean;

    /** 
     * A structure that tracks the number of cards received from Firestore during the
     * bootstrap process. This record is added when ZDeckEditor mounts and is deleted
     * after the Deck and all cards have been received from Firestore.
     */
    bootstrap?: DeckBootstrap;

    /**
     * State used during the process of adding a card to the deck.
     */
    cardAdd?: CardAdd;

    /**
     * State used during the process of removing a card from the deck.
     */
    cardRemove?: CardRemove;

}

export interface LerniApp {

    /** Details about the current session */
    session?: Session,

    /** The state of the Registration dialog */
    authRegisterState?: RegisterState,

    /** The registration form for the email/password option */
    registerEmailForm?: RegisterEmailForm,

    /** 
     * The form used to reauthenticate during the `Delete Account`
     * workflow if the user is authenticated by email/password
     */
    deleteAccountForm?: PasswordCredentials,

    /** The state of the SignIn dialog */
    signInState?: SigninState,

    passwordSigninForm?: PasswordCredentials,

    /** Data used to display a transient Alert */
    alertData?: AlertData,

    /** The user's Library of resources */
    library?: ClientLibrary,

    /** The status of the process to load the current deck */
    deckLoadStatus?: LoadStatus,

    /** The current deck being edited or viewed */
    deck?: Deck,

    /** A map containing the cards within the current deck */
    cards: Record<string, CardInfo>,

    deckEditor?: DeckEditor

}

