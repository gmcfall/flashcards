
export interface Flashcard {

    /** An identifier for the card */
    id: string,

    /** The card contents represented as an HTML string */
    content: string,
}

export interface Deck {
    /** An identifier for this Deck */
    id: string,

    /** A friendly name for the Deck suitable for display */
    name: string,

    /**
     * A map of cards where the key is the card `id` and the value is
     * the Flashcard object.
     */
    cards: Record<string, Flashcard>,

    /** 
     * The order in which cards should be displayed.
     * Each element of the array is the id for a Flashcard.
     */
    sequence: [string]
}

export interface PersonalLibrary {

}

export interface ErrorInfo {
    message: string,
    error?: Error | unknown
}

type RegisterState =  'REGISTER_BEGIN' | 'REGISTER_EMAIL';
export const REGISTER_BEGIN = 'REGISTER_BEGIN';
export const REGISTER_EMAIL = 'REGISTER_EMAIL';

type SigninState = 'SIGNIN_BEGIN' | 'SIGNIN_EMAIL';
export const SIGNIN_BEGIN = 'SIGNIN_BEGIN';
export const SIGNIN_EMAIL = 'SIGNIN_EMAIL';

export interface MinimalUser {
    uid: string,
    displayName: string,
    providers: string[]
}
export interface Session {
    user: MinimalUser
}

export interface DeckApp {

    /** Details about the current session */
    session?: Session,

    /** The state of the Registration dialog */
    authRegisterState?: RegisterState,

    /** The state of the SignIn dialog */
    signInState?: SigninState,

    /** The current deck being edited */
    deck?: Deck
}

