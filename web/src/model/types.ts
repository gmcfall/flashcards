
import { JSONContent } from "@tiptap/core";
import { FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { FieldValue } from "firebase/firestore";
import { EntityTuple } from "@gmcfall/react-firebase-state";
import { ParsedUrlQuery } from "querystring";

export type { JSONContent } from "@tiptap/core";

export interface ClientTimestamp {
    seconds: number,
    nanoseconds: number
}

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
export const FLASHCARD: FlashCardType = 'flashcard';

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

    /** A friendly name for the resource suitable for display to users */
    name: string

    /** The type of resource */
    type: ResourceType,

    /** The uid of the User who owns this resource */
    owner: string;
}

export interface PartialMetadata extends ResourceRef {

    /** The uid of the User who owns this resource */
    owner?: string;
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

export interface ProtoAccessRequest {
    /** An identifier for the request */
    id: string,

    /** The timestamp when the request was created */
    createdAt: FieldValue;

    /** The id of the resource for which access is requeste */
    resourceId: string;

    /** The identity of the user requesting access */
    requester: Identity;

    /** An optional message */
    message?: string;
}



export interface ProtoAccessResponse {
    /** An identifier for the request */
    id: string,

    /** The timestamp when the request was created */
    createdAt: FieldValue;

    /** The id of the resource for which access is requeste */
    resourceId: string;

    /** True if access was granted and false otherwise */
    accepted: boolean;

    /** An optional message */
    message?: string;
}

export interface AccessNotificationBase {
    /** An identifier for the request */
    id: string,

    /** The timestamp when the request was created */
    createdAt: ClientTimestamp;

    /** The id of the resource for which access is requeste */
    resourceId: string;

    /** An optional message from the requester */
    message?: string;
}

export interface AccessRequest extends AccessNotificationBase {
    
    /** The identity of the user requesting access */
    requester: Identity;
}

export interface AccessResponse extends AccessNotificationBase {

    /** True if access was granted and false otherwise */
    accepted: boolean;
}

export type AccessNotification = AccessRequest | AccessResponse;

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

    notifications: Record<string, AccessNotification>;


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
     * These tags are derived by splitting the `searchString` into an array of 
     * space-separated words, filtering to exclude stop words and computing the 
     * Porter stem of each remaining word.
     */
    searchTags: string[];
}

export interface ClientLibrary {
    
    /** The list of (possibly incomplete) metadata for resources in the library */
    resources: PartialMetadata[];

    /** The list of access notifications */
    notifications: AccessNotification[];
}

/**
 * A possible return value from the `providerSignIn` and `emailPasswordSignIn` functions.
 */
export type SignInResult =
    'SIGNIN_FAILED' |
    'GET_IDENTITY_FAILED' |
    'IDENTITY_NOT_FOUND' |
    'SIGNIN_OK'


/** 
 * A return value from `providerSignIn` or `emailPasswordSignIn` indicating that the 
 * Firebase threw an error during the sign in process.
 */
export const SIGNIN_FAILED: SignInResult ='SIGNIN_FAILED';

/**
 * A return value from `providerSignIn` or `emailPasswordSignIn` indicating that an error 
 * occurred while getting the Identity document from Firestore after a successful signin.
 */
export const GET_IDENTITY_FAILED: SignInResult = 'GET_IDENTITY_FAILED';

/**
 * A return value from `providerSignIn` or `emailPasswordSignIn` indicating that the 
 * Identity document from Firestore was not found after a successful signin.
 */
export const IDENTITY_NOT_FOUND: SignInResult = 'IDENTITY_NOT_FOUND';

/**
 * A return value from `providerSignIn` or `emailPasswordSignIn` indicating that the 
 * sign in process was successful.
 */
export const SIGNIN_OK: SignInResult = 'SIGNIN_OK';


/**
 * A representation of a User stored in the client-side Session.
 * This reduces our reliance on the Firebase API should we need to
 * switch later.
 */
export interface SessionUser extends Identity {

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

export interface UserProfile {

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
 * A Firestore document that stores information about a person's identity 
 * 
 * Firestore Path: `/identities/{user.uid}`
 */
export interface Identity extends UserProfile {

    /** The unique, immutable identifier assigned by Firebase Authentication */
    uid: string;
}


/**
 * The default `displayName` for users
 */
export const ANONYMOUS = "Anonymous";

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

export interface IdentityRole {
    identity: Identity;
    role: Role;
}

/**
 * A Firestore document that defines the access control rules for a given Deck
 * 
 * Firestore path: /access/{deck.id}
 */
export interface Access {
    /** The uid of the user who owns the Deck */
    owner: string;

    /**
     * A record of the collaborators who may access the Deck.
     * The key is the users `uid`.
     * The value encapsulates the collaborator's identity and a Role.
     */
    collaborators: Record<string, IdentityRole>;

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
export const LOCK_CLOSED: SharingIconType = 'lockClosed';

/** The `openLock` element of the `SharingIcon` type */
export const LOCK_OPEN: SharingIconType = 'lockOpen';

/** The `globe` element of the `SharingIcon` type */
export const GLOBE: SharingIconType = 'globe';

/** A Permission that can be granted to a user for access to some resource */
export type Permission = 'edit' | 'view' | 'share';

export const EDIT: Permission = 'edit';
export const VIEW: Permission ='view';
export const SHARE: Permission = 'share';

export interface ClientAccess extends Access {
    resourceId: string;
}

export type AccessTuple = EntityTuple<ClientAccess>;


export type BooleanState = [boolean, (value: boolean) => void]

/** Encapsulates the request and response for the current resource search */
export interface ResourceSearch {

    /** 
     * The search string from the user, plus the set of tags derived
     * from the search string.
     */
    request: ResourceSearchRequest;

    /** 
     * The resources matching the search request. This array is updated as
     * partial search results are received from Firestore.
     */
    response: ResourceRef[];
}

export interface LerniApp {

    authUser?: SessionUser;
        
    /** Data used to display a transient Alert */
    alertData?: AlertData;

    /** The request and reponse for the current search request */
    resourceSearch?: ResourceSearch;
}

export interface DeckQuery extends ParsedUrlQuery {
    deckId: string;
    cardIndexSlug: undefined | string[];
}

