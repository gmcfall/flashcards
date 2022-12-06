
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

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export const ERROR = 'error';
export const WARNING = 'warning';
export const INFO = 'info';
export const SUCCESS = 'success';

export interface AlertData {
    severity: AlertSeverity,
    message: string
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

    /** Data used to display a transient Alert */
    alertData?: AlertData;

    /** The current deck being edited */
    deck?: Deck
}

