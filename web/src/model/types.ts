
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

export type RegisterState =  'REGISTER_BEGIN' | 'REGISTER_EMAIL';
export const REGISTER_BEGIN = 'REGISTER_BEGIN';
export const REGISTER_EMAIL = 'REGISTER_EMAIL';

export type SigninState = 'SIGNIN_BEGIN' | 'SIGNIN_PASSWORD';
export const SIGNIN_BEGIN = 'SIGNIN_BEGIN';
export const SIGNIN_PASSWORD = 'SIGNIN_PASSWORD';

export interface MinimalUser {
    uid: string,
    displayName: string,
    providers: string[]
}
export interface Session {
    user: MinimalUser
}

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

export interface DeckApp {

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

    /** The current deck being edited */
    deck?: Deck
}

