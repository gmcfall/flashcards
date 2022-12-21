
import {JSONContent} from "@tiptap/core";
import { FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";

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

    /** The person's `username` without the leading "@" */
    username?: string;
}

export interface UserNames {
    displayName: string;
    username: string;
}

/**
 * A ClientFlashcard plus additional information related to the card.
 */
export interface CardInfo {
    card: ClientFlashcard
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

    /** The `id` of the resource */
    id: string;

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
    id: string;

    /** A friendly name for the Deck suitable for display */
    name: string;

    /** 
     * A list of references to cards within this Deck.
     */
    cards: CardRef[];

    isPublished: boolean;
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
 * A Firestore document that stores "tags" under which some resource is indexed for searching.
 * 
 * Firestore path: /tags/{resource.id}
 * 
 * Each tag is the porter stem for a word from the deck name or the card contents.
 * Tags exclude pronouns, determiners, conjunctions, and prepositions
 */
export interface Tags {

    /** The last list tags published for the resource */
    tags: string[];
}

/**
 * A Firestore document that provides the `id` and `name` for each resource 
 * containing a given tag.
 * 
 * Firestore path: /search/{tag}
 */

export interface ResourceSearchServerData {
    /** 
     * A Record whose key is the id of a resource and whose value is 
     * a reference to the resource.
     */
    resources: Record<string, ResourceRef>;
}

export interface ResourceSearchRequest {
    /** The full search string typed by the user */
    searchString: string;

    /**
     * The tags to be searched.
     * 
     * This value is computed by splitting the `searchString` into an array of
     * space-separated words and then filtering to exclude stop words.
     */
    searchTags: string[]
}

/**
 * Encapsulates a ServerResourceSearch document for a given tag.
 */
export interface ResourceSearchResponsePart {
    /** A tag derived from the `searchString` */
    tag: string;

    /** ServerResourceSearch document for the given `tag` */
    serverData: ResourceSearchServerData;
}



/**
 * A client-side object encapsulating `SearchRequest` and `SearchResponse` data plus
 * the status of the search.
 * 
 * The status changes according to the following rules.
 * - `pending`: The cache does not contain results from all tags in the search string
 * - `fulfilled`: The cache contains results from all tags in the search string
 * - `failed`: An error occurred while performing the search
 */
export interface ResourceSearchClientData extends ResourceSearchRequest {
    /**
     * The status of the search process
     */
    status: LoadStatus;

    /** 
     * A cache of ServerSearch records retreived from Firestore.
     * Each key in the Record is a tag and the value is the
     * ServerSearch document for that tag.
     */
    cache: Record<string, ResourceSearchServerData>;

    /**
     * An array of Resource references sorted alphabetically.
     */
    resources: ResourceRef[];
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

export type RegisterStage =  (
    'REGISTER_BEGIN' | 
    'REGISTER_EMAIL' |
    'REGISTER_EMAIL_USERNAME_RETRY' |
    'REGISTER_EMAIL_VERIFY' | 
    'REGISTER_PROVIDER_USERNAME' |
    'REGISTER_PROVIDER_END'
);

/**
 * The stage at the beginning of the registration workflow.
 * This is where the user must choose an identity provider.
 */
export const REGISTER_BEGIN: RegisterStage = 'REGISTER_BEGIN';

/**
 * The stage immediately after the user chooses to use the "password" identity
 * provider. At this point the form for entering the `email`, `password` and
 * `displayName` is rendered.
 */
export const REGISTER_EMAIL: RegisterStage = 'REGISTER_EMAIL';

/**
 * The stage immediately after the user submits the email/password credentials
 * and the local `Identity` document has been persisted. At this point, the user 
 * is presented with a notice that the verification email was sent.
 */
export const REGISTER_EMAIL_VERIFY: RegisterStage = 'REGISTER_EMAIL_VERIFY';


/**
 * The stage immediately after registering via an identity provider (Google, Facebook, or Twitter).
 * At this stage, the user must enter a `username` and optionally update the `displayName`
 */
export const REGISTER_PROVIDER_USERNAME: RegisterStage = 'REGISTER_PROVIDER_USERNAME';

/**
 * This stage occurs after the entire workflow for registering via an identity provider
 * (Google, Facebook, or Twitter) is complete. The user is presented with an
 * Alert announcing that the account is ready for use.
 */
export const REGISTER_PROVIDER_END: RegisterStage = 'REGISTER_PROVIDER_END';

/**
 * This stage occurs if an account was created but the requested `username`
 * is not availabe. The user is presented with a form to request a different
 * `username`
 */
export const REGISTER_EMAIL_USERNAME_RETRY: RegisterStage = 'REGISTER_EMAIL_USERNAME_RETRY';

/** 
 * A message indicating that sign-in via an external AuthProvider 
 * (Google, Facebook, Twitter) failed.
 * 
 * This message is encapsulated in an Error thrown by `providerSignIn`
 */
export const SIGNIN_FAILED ='SIGNIN_FAILED';

/**
 * A message indicating that an error occurred while getting
 * the Identity document from Firestore after a successful signin
 * from an external AuthProvider (Google, Facebook, Twitter).
 * 
 * This message is encapsulated in an Error thrown by `providerSignIn`
 */
export const GET_IDENTITY_FAILED = 'GET_IDENTITY_FAILED';

/**
 * A message indicating that the Identity document from Firestore
 * was not found after a successful signin from an exernal 
 * AuthProvider (Google, Facebook, Twitter).
 * 
 * This message is encapsulated in an Error thrown by `providerSignIn`
 */
export const IDENTITY_NOT_FOUND = 'IDENTITY_NOT_FOUND';

/**
 * A representation of a User stored in the client-side Session.
 * This reduces our reliance on the Firebase API should we need to
 * switch later.
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
    requiresEmailVerification?: boolean
}

export const ProviderNames: Record<string, string> = {
    [GoogleAuthProvider.PROVIDER_ID]: "Google",
    [FacebookAuthProvider.PROVIDER_ID]: "Facebook",
    [TwitterAuthProvider.PROVIDER_ID]: "Twitter"
}

export interface Session {
    /** The current user, or undefined if the user is not signed in */
    user?: SessionUser
}

/** 
 * A Firestore document that stores information about a person's identity 
 * 
 * Firestore Path: `/identities/{user.uid}`
 */
export interface Identity {

    /** The unique, immutable identifier assigned by Firebase Authentication */
    uid: string;

    /**
     * The person's username, without the leading `@`
     */
    username: string;

    /** 
     * The person's display name. This can be the person's real name or
     * an alias.
     */
    displayName: string;
}


/**
 * The default `displayName` for users
 */
export const ANONYMOUS = "Anonymous";


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
export type Role = 'owner' | 'editor' | 'viewer';
export type GeneralRole = 'editor' | 'viewer';

/** The 'owner' Role */
export const OWNER: Role = "owner";

/** The 'editor' Role */
export const EDITOR: Role ="editor";

/** The 'viewer' Role */
export const VIEWER: Role ="viewer"

export const RoleName: Record<Role, string> = {
    [OWNER] : "Owner",
    [EDITOR] : "Editor",
    [VIEWER] : "Viewer"
}

/**
 * A Firestore document that defines the access control rules for a given Deck
 * 
 * Firestore path: /access/{deck.id}
 */
export interface Access {
    /** The uid of the user who owns the Deck */
    owner: string;

    /** The roles for general access to the Deck */
    general?: GeneralRole;
}


/**
 * The type of icon to be rendered with the "Share" button.
 * - `lockClosed`: Only the owner has access
 * - `lockOpen`:   Only the owner and users in the control list have access
 * - `globe`: Anyone with the link has access
 */
export type SharingIconType = 'lockClosed' | 'lockOpen' | 'globe';

/** The `closedLock` element of the `SharingIcon` type */
export const LOCK_CLOSED = 'lockClosed';

/** The `openLock` element of the `SharingIcon` type */
export const LOCK_OPEN = 'lockOpen';

/** The `globe` element of the `SharingIcon` type */
export const GLOBE = 'globe';

/** An error code that may occur when trying to access a resource */
export type ResourceError = 'notFound' | 'accessDenied' | 'unknownError';

/** The "notFound" member of the `ResourceError` type */
export const NOT_FOUND = 'notFound';
/** The "accessDenied" member of the `ResourceError` type */
export const ACCESS_DENIED = 'accessDenied';
/** The "unknownError" member of the `ResourceError` type */
export const UNKNOWN_ERROR = 'unknownError';

/** A Permission that can be granted to a user for access to some resource */
export type Permission = 'edit' | 'view' | 'share';

export const EDIT: Permission = 'edit';
export const VIEW: Permission ='view';
export const SHARE: Permission = 'share';


/** 
 * Encapsulates information about an Access document from Firestore.
 * 
 * We derive the following load status values from this information: 
 * - *pending*: `!payload && (!error || !withUser || error==="accessDenied")`
 * - *fulfilled*: `!!payload`
 * - *failed* : `!payload && withUser`
 */
export interface AccessEnvelope {
    /** The id of the resource governed by the Access document */
    resourceId: string;
    

    /**
     * The uid of the user who was signed in at the time of the
     * last get request, or undefined if no user was signed in.
     */
    withUser?: string;


    /** 
     * The reason why the latest attempt to get the Access document
     * failed. If the reason is "notFound", there will be no further
     * attempts.
     */
    error?: ResourceError;

    /**
     * The Access document that was received for the specified
     * `resourceId`, if any
     */
    payload?: Access;
}

/** The status of a loading process */
export type LoadStatus = 'pending' | 'fulfilled' | 'failed';

/** The 'pending' value of the LoadStatus type*/
export const PENDING = 'pending';

/** The 'fullfilled' value of the LoadStatus type*/
export const FULFILLED ='fulfilled';

/** The 'failed' value of the LoadStatus type */
export const FAILED = 'failed';


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
 * The `cardId` field is set when the Firestore listener receives an "added" Flashcard.
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
    authRegisterStage?: RegisterStage,

    /** 
     * The form used to reauthenticate during the `Delete Account`
     * workflow if the user is authenticated by email/password
     */
    deleteAccountForm?: PasswordCredentials,


    /**
     * A flag which specifies whether the user is actively signing in.
     * When true, the ZSigninWizard is open.
     */
    signinActive?: boolean;

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

    resourceSearch?: ResourceSearchClientData;

    /** An envelope encapsulating the access control list for the active Deck */
    deckAccess?: AccessEnvelope;
    
    /** 
     * A structure that tracks the number of cards received from Firestore during the
     * bootstrap process. This record is added when ZDeckEditor mounts and is deleted
     * after the Deck and all cards have been received from Firestore.
     */
    deckBootstrap?: DeckBootstrap;

    /** Details about the DeckEditor currently active */
    deckEditor?: DeckEditor;

}

