

export type FlashCardType = 'flashcard';
/** The "flashcard" value of the FlashCardType */
export const FLASHCARD = 'flashcard';

export interface Flashcard {

    type: FlashCardType,

    /** An identifier for the card */
    id: string,


    /** The id of the deck that owns this card */
    ownerDeck: string,

    /** The card content represented as an HTML string */
    content: string,
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
    card: Flashcard,

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
 */
export type ResourceType = 'deck';

/**
 * The string used as the Deck `type`.
 */
export const DECK = 'deck';

export interface ResourceRef {
    
    /** The type of resource */
    type: ResourceType,

    /** An identifier for the resource */
    id: string,

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
     * A map where the key is the `id` for a Resource and the value is reference to tha resource. 
     * This structure makes it easy to update individual entries via the Firestore SDK.
     * See {@link ClientLibrary} for the client-side representation of the library.
     */
    resources: Record<string, ResourceRef>
}

/**
 * A client-side representation of a user's library of resources.
 * In this representation, the map from the {@link FirestoreLibrary} is
 * converted to an array sorted alphabetically.
 */
export interface ClientLibrary {
    resources: ResourceRef[]
}

export interface ErrorInfo {
    message: string,
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

/**
 * Defines the access control rules for a given Deck
 */
export interface DeckAccess {
    /** The uid of the user who owns the Deck */
    owner: string;
}


export interface DeckLibrary {
    /** A unique identifier for the library */
    id: string,

}

/** The status of a loading process */
export type LoadStatus = 'pending' | 'failed';

/** The 'pending' value of the LoadStatus type*/
export const PENDING='pending';

/** The 'failed' value of the LoadStatus type */
export const FAILED='failed';

export interface DeckEditor {
    /**
     * The id of the "active" card, i.e. the one currently
     * loaded into the rich text editor.
     */
    activeCard?: string;
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

    deckEditor: DeckEditor

}

