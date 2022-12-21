import EmailIcon from '@mui/icons-material/Email';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { AuthProvider, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { useState } from "react";
import { batch } from 'react-redux';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { emailPasswordSignIn, providerSignIn, selectSigninActive } from '../model/auth';
import { GET_IDENTITY_FAILED, IDENTITY_NOT_FOUND, ProviderNames, SIGNIN_FAILED } from '../model/types';
import alertPost from '../store/actions/alertPost';
import authSessionBegin from '../store/actions/authSessionBegin';
import authSignin from "../store/actions/authSignin";
import { dialogContentStyle } from './lerniConstants';
import LerniTheme from './lerniTheme';
import ZFacebookIcon from './ZFacebookIcon';
import ZGoogleIcon from './ZGoogleIcon';
import ZTwitterIcon from './ZTwitterIcon';


enum SigninStage {
    /**
     * The user is presented with sign in options.
     * Options include with Google, Facebook, Twitter, or Email/Password.
     */
    begin,

    /**
     * The user has selected the email/password option.
     * The wizard renders a form for collecting those credentials.
     */
    email,

    /**
     * The user attempted to sign in with an identity provider
     * (Google, Facebook, Twitter), but the signin process threw
     * an error.
     */
    providerError,

    /**
     * The user attempted to sign in with email/password, but the
     * sign in process threw an error.
     */
    emailError
}

interface ProviderError {
    provider: AuthProvider;
    error: Error;
}

interface SigninBeginProps {
    setStage: (value: SigninStage) => void;
    setProviderError: (value: ProviderError | null) => void;
    onClose: () => void;
}

function ZSigninBegin(props: SigninBeginProps) {

    const {onClose, setStage, setProviderError} = props;
    const dispatch = useAppDispatch();

    function handleProviderClick(provider: AuthProvider) {
        providerSignIn(provider).then(
            session => {
                batch(() => {
                    dispatch(authSessionBegin(session));
                    dispatch(alertPost({
                        severity: "success",
                        message: "Welcome back!"
                        
                    }))
                })
                onClose();
            }
        ).catch(
            error => {
                if (error instanceof Error) {
                    if (error.cause) {
                        console.error(error.message, error.cause);
                    } else {
                        console.error(error.message);
                    }
                    setProviderError({error, provider});
                    setStage(SigninStage.providerError)
                } else {
                    console.error("ZSigninBegin: Unexpected provider error", error);
                }
            }
        )
    }

    function handlePasswordClick() {
        setStage(SigninStage.email);
    }

    return (
        <>
            <DialogContent>
                <Box sx={{display: "flex", flexDirection: 'column'}}>

                    <Box sx={dialogContentStyle}>
                        <Button
                            startIcon={<ZGoogleIcon/>} sx={{height: '2em'}}
                            onClick={() => handleProviderClick(new GoogleAuthProvider())}
                        >
                            Continue with Google
                        </Button>
                        <Button 
                            startIcon={<ZFacebookIcon/>}
                            onClick={() => handleProviderClick(new FacebookAuthProvider())}
                        >
                            Continue with Facebook
                        </Button>
                        <Button 
                            startIcon={<ZTwitterIcon/>}
                            onClick={() => handleProviderClick(new TwitterAuthProvider())}
                        >
                            Continue with Twitter
                        </Button>
                        <Button 
                            startIcon={<EmailIcon/>}
                            onClick={handlePasswordClick}
                        >
                            Sign in with email and password
                        </Button>
                    </Box>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </>
    )

}

interface SigninEmailProps {
    onClose: () => void;
}

function showEmailSubmitButton(errorCode: string) {
    return !errorCode || errorCode===SIGNIN_FAILED;
}

function emailErrorMessage(errorCode: string) {
    switch (errorCode) {
        case SIGNIN_FAILED:
            return (
                <>
                The email and password that you submitted do not match our records.
                </>
            )

        case IDENTITY_NOT_FOUND:
            return (
                <>
                <b>Something went wrong</b>
                <p>We could not locate your account details.</p>
                </>
            )

        default:
            return (
                <>
                <b>Oops! A server error occurred</b>
                <p>You are not signed in.</p>
                </>
            )
    }
}

function emailAlert(errorCode: string) {
    return (        
        <Alert severity="error" sx={{fontSize: "1rem"}}>
            {emailErrorMessage(errorCode)}
        </Alert>
    )
}

function ZSigninEmail(props: SigninEmailProps) {
    const {onClose} = props;

    const dispatch = useAppDispatch();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorCode, setErrorCode] = useState<string>('');

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        setEmail(value);
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        setPassword(value);
    }

    function handleSubmit() {
        emailPasswordSignIn(email, password).then(
            (session => {
                batch(() => {
                    dispatch(authSessionBegin(session));
                    dispatch(alertPost({
                        severity: "success",
                        message: "Welcome back!"
                        
                    }))
                })
                onClose();
            })
        ).catch(
            error => {
                console.error(error);
                if (error instanceof Error) {
                    setErrorCode(error.message);
                }
            }
        )
    }

    return (
        <>
        <DialogContent>            
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "2em",
                gap: "2em",
                minWidth: "30em"
            }}>
                {errorCode && emailAlert(errorCode)}
                <TextField
                    value={email}
                    label="Email"
                    onChange={handleEmailChange}
                />
                <TextField
                    type="password"
                    label="Password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" onClick={onClose}>
                Cancel
            </Button>
            {showEmailSubmitButton(errorCode) && (
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            )}
        </DialogActions>
        </>
    )
    
}

interface ProviderErrorProps {
    onClose: () => void;
    providerError: ProviderError | null;
    setStage: (value: SigninStage) => void;
}

function renderProviderError(
    providerError: ProviderError | null, 
    setStage: (value: SigninStage) => void
) {
    if (providerError) {
        const message = providerError.error.message;
        const providerId = providerError.provider.providerId;
        const providerName = ProviderNames[providerId];
        switch (message) {
            case SIGNIN_FAILED: 
                return (
                    <>
                    <b>Something went wrong</b>
                    <p>
                        {`You are not signed in because we could not get your account information from ${providerName}.`}
                    </p>
                    </>
                )

            case GET_IDENTITY_FAILED:
                return (
                    <>
                    <b>An error occurred while fetching your account details</b>
                    <p>
                        You are not signed in.
                    </p>
                    </>
                )

            case IDENTITY_NOT_FOUND:
                return (
                    <>
                    <b> {`We could not find an account linked to your ${providerName} account.`}</b>
                    <p>
                        You might want to
                        <Button
                            size="small"
                            onClick={() => setStage(SigninStage.begin)}
                        >
                            go back
                        </Button>
                        and try a different sign-in method.
                    </p>
                    </>
                )
        }
    }

    return (
        <>
        <b>Oops! A server error occurred</b>
        <p>
            You are not signed in.
        </p>
        </>
    )
}

function ZProviderError(props: ProviderErrorProps) {
    const {onClose, providerError, setStage} = props;

    return (
        <>
            <DialogContent>
                <Alert severity="error" sx={{
                    fontSize: "1rem",
                    marginTop: "1em"
                }}>
                    {renderProviderError(providerError, setStage)}
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant="contained"
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </>
    )
}


function ZSigninBody() {
    const dispatch = useAppDispatch();
    const [stage, setStage] = useState<SigninStage>(SigninStage.begin);
    const [providerError, setProviderError] = useState<ProviderError | null>(null);
    
    function handleClose() {
        dispatch(authSignin(false));
    }

    switch (stage) {
        case SigninStage.begin:
            return <ZSigninBegin
                onClose={handleClose}
                setStage={setStage}
                setProviderError={setProviderError}
            />

        case SigninStage.providerError:
            return <ZProviderError
                onClose={handleClose}
                providerError={providerError}
                setStage={setStage}
            />

        case SigninStage.email:
            return <ZSigninEmail
                onClose={handleClose}
            />
    }

    return null;
}

export function ZSigninWizard() {

    const signinActive = useAppSelector(selectSigninActive);
    if (!signinActive) {
        return null;
    }
    
    return (
        <Dialog open={true}>
            <DialogTitle sx={{
                margin: 0, 
                padding: 2,
                borderBottomWidth: 1,
                borderBottomColor: LerniTheme.dividerColor,
                borderBottomStyle: "solid"
            }}>
                Sign in
            </DialogTitle>
            <ZSigninBody/>

        </Dialog>
    );
}