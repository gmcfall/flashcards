import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import {
    Alert,
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Typography
} from '@mui/material';
import { AuthProvider, FacebookAuthProvider, getAuth, GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useSessionUser } from '../hooks/customHooks';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { providerRegister0, selectRegistrationState, submitEmailRegistrationForm, submitIdentityCleanup } from '../model/auth';
import firebaseApp from '../model/firebaseApp';
import { replaceAnonymousUsername } from '../model/identity';
import { ProviderNames, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_USERNAME_RETRY, REGISTER_EMAIL_VERIFY, REGISTER_PROVIDER_END, REGISTER_PROVIDER_USERNAME } from '../model/types';
import authRegisterCancel from '../store/actions/authRegisterCancel';
import authRegisterStageUpdate from '../store/actions/authRegisterStageUpdate';
import { AppDispatch } from '../store/store';
import { dialogContentStyle } from './lerniConstants';
import LerniTheme from './lerniTheme';
import ZDisplayNameField, { validateDisplayName } from './ZDisplayNameField';
import ZFacebookIcon from './ZFacebookIcon';
import ZGoogleIcon from './ZGoogleIcon';
import ZTwitterIcon from './ZTwitterIcon';
import ZUsernameField, { usernameNotAvailable, validateUsername } from './ZUsernameField';



interface RegisterTitleProps extends RegisterWizardCloser {
    omitCloseButton: boolean;
}

export function ZRegisterTitle(props: RegisterTitleProps) {
    const {onClose, omitCloseButton} = props;

    return (
        <DialogTitle sx={{
            display: "flex",
            alignItems: "center", 
            margin: 0, 
            padding: 2,
            borderBottomWidth: 1,
            borderBottomColor: LerniTheme.dividerColor,
            borderBottomStyle: "solid"
        }}>
            <Box component="span" sx={{flexGrow: 1}}>Create an account</Box>

            {!omitCloseButton && (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            )}
        </DialogTitle>
    )
}

interface RegisterProviderErrorProps extends RegisterWizardCloser {
    providerName: string;
}

function ZRegisterProviderError(props: RegisterProviderErrorProps) {

    const {onClose, providerName} = props;

    return (
        <>
            <DialogContent>
                <Alert severity="error" sx={{marginTop: "1em"}}>                    
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
                        <Typography>
                            An error occurred while communicating with {providerName}.
                        </Typography>
                        <Typography>
                            Try again in a few minutes.
                        </Typography>
                    </Box>
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant="contained"
                    onClick={onClose}
                >
                    OK
                </Button>
            </DialogActions>
        </>
    )
}

function registerViaProvider(
    dispatch: AppDispatch, 
    provider: AuthProvider,
    setError: (value: string | null) => void
) {
    providerRegister0(dispatch, provider).catch(
        error => {
            if (error instanceof Error) {
                console.error(error.message);
                const providerName = ProviderNames[provider.providerId];
                setError(providerName);
            }
        }
    )
}

function ZRegisterBegin(props: RegisterWizardCloser) {
    const {onClose} = props;
    
    const dispatch = useAppDispatch();
    const [error, setError] = useState<string | null>(null);

    function handleGoogleClick() {
        registerViaProvider(dispatch, new GoogleAuthProvider(), setError);
    }

    function handleFacebookClick() {
        registerViaProvider(dispatch, new FacebookAuthProvider(), setError);
    }

    function handleTwitterClick() {
        registerViaProvider(dispatch, new TwitterAuthProvider(), setError);
    }

    function handleEmailClick() {
        dispatch(authRegisterStageUpdate(REGISTER_EMAIL));
    }

    if (error) {
        return <ZRegisterProviderError providerName={error} onClose={onClose}/>
    }

    return (
        <DialogContent>
        <Box sx={{display: "flex", flexDirection: 'column'}}>

            <Box sx={dialogContentStyle}>
                <Button 
                    startIcon={<ZGoogleIcon/>}
                    onClick={handleGoogleClick}
                >
                    Continue with Google
                </Button>
                <Button 
                    startIcon={<ZFacebookIcon/>}
                    onClick={handleFacebookClick}
                >
                    Continue with Facebook
                </Button>
                <Button 
                    startIcon={<ZTwitterIcon/>}
                    onClick={handleTwitterClick}
                >
                    Continue with Twitter
                </Button>
                <Button 
                    startIcon={<EmailIcon/>}
                    onClick={handleEmailClick}
                >
                    Create an account with Email and Password
                </Button>

            </Box>

        </Box>
        </DialogContent>
    )
}



function ZEmailUsernameRetry()  {
    
    const [username, setUsername] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string>("");
    const dispatch = useAppDispatch();
    const user = useSessionUser();

    function handleSubmit() {
        const ok = validateUsername(username, setUsernameError);
        if (ok) {
            if (user) {
                replaceAnonymousUsername(user.uid, username).then((saveOk)=>{
                    if (!saveOk) {
                        setUsernameError(usernameNotAvailable(username));
                    } else {
                        dispatch(authRegisterStageUpdate(REGISTER_EMAIL_VERIFY));
                    }
                })
            }
        }
    }

    return (
        <>
            <DialogContent>
                <DialogContentText>
                    The username you requested is not available. 
                    Please try a different username.
                </DialogContentText>
                <Box sx={{
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "2em", 
                    minWidth: "30em",
                    marginTop: "20px"
                }}>
                    <ZUsernameField
                        username={username}
                        setUsername={setUsername}
                        usernameError={usernameError}
                        setUsernameError={setUsernameError}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
            
        </>
    )
}



function ZRegisterWithEmail() {
    
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [displayNameError, setDisplayNameError] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string>("");

    const anyError = Boolean(
        emailError || passwordError || displayNameError || usernameError
    )

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        if (emailError) {
            const trimmed = value.trim();
            if (trimmed.length>0) {
                setEmailError("");
            }
        }
        setEmail(value);
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        if (passwordError) {
            const trimmed = value.trim();
            if (trimmed.length>0) {
                setPasswordError("");
            }
        }
        setPassword(value);
    }


    function handleSubmit() {
        const emailValue = email.trim();
        let hasError = false;
        if (emailValue.length===0) {
            setEmailError("Your email address is required");
            hasError = true;
        }

        const passwordValue = password.trim();
        if (passwordValue.length===0) {
            setPasswordError("A password is required");
            hasError = true;
        }

        hasError = !validateDisplayName(displayName, setDisplayNameError) || hasError;
        hasError = !validateUsername(username, setUsernameError) || hasError;
        
        if (!hasError) {
            setSubmitDisabled(true);
            submitEmailRegistrationForm(dispatch, email, password, displayName, username).then(
                stage => {
                    if (stage === REGISTER_EMAIL) {
                        setSubmitDisabled(false);
                        setUsernameError(usernameNotAvailable(username));
                    } else {
                        dispatch(authRegisterStageUpdate(stage))
                    }
                }
            ).catch(
                (error) => {
                    setServerError("An error occurred while creating your account");
                    if (error instanceof Error) {
                        console.error("submitEmailRegistrationForm failed: " + error.message);
                    }
                }
            )
        }
    }

    return (
        <>
            <DialogContent>
            
                <Box sx={{
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "2em", 
                    minWidth: "30em",
                    marginTop: "20px"
                }}>
                    {serverError && (
                        <Box sx={{marginTop: "10px", marginBottom: "10px"}}>
                            <Alert severity='error'>
                                {serverError}
                            </Alert>
                        </Box>
                    )}
                    
                    <TextField 
                        error={Boolean(emailError)}
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={handleEmailChange}
                        helperText={emailError || null}
                    />
                    <TextField
                        label="Password"
                        error={Boolean(passwordError)}
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        helperText={passwordError || null}
                    />

                    <ZDisplayNameField
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        displayNameError={displayNameError}
                        setDisplayNameError={setDisplayNameError}
                    />
                    <ZUsernameField 
                        username={username}
                        setUsername={setUsername}
                        usernameError={usernameError}
                        setUsernameError={setUsernameError}
                    />
                    
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={anyError || submitDisabled}
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
            
        </>
    )
}

function ZEmailVerify(props: RegisterWizardCloser) {
    const {onClose} = props;

    return (
        <>
            <Box>
                <Alert severity='info'>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
                        <Typography>
                            Almost done! You need to verify your email address.
                        </Typography>
                        <Typography>
                            We sent you an email containing a link to complete 
                            the verification process. Simply follow the link.
                        </Typography>
                        <Typography>
                            If you don't find the email in your inbox, check your
                            spam folder.
                        </Typography>
                        <Typography>
                            You won't be able to use your account until you complete
                            the verification process.
                        </Typography>
                    </Box>
                </Alert>
            </Box>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>OK</Button>
            </DialogActions>
        </>
    )
}



function ZProviderUsername() {
    const dispatch = useAppDispatch();
    const user = useSessionUser();
    const [displayName, setDisplayName] = useState<string>("");
    const [displayNameError, setDisplayNameError] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [serverError, setServerError] = useState<string>("");
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

    useEffect(() => {

        const auth = getAuth(firebaseApp);
        const authUser = auth.currentUser;
        if (authUser?.displayName) {
            setDisplayName(authUser.displayName);
        }

    }, [])

    const anyError = Boolean(
        displayNameError || usernameError
    )

    function handleSubmit() {

        let hasError = false;
        hasError = !validateDisplayName(displayName, setDisplayNameError) || hasError;
        hasError = !validateUsername(username, setUsernameError) || hasError;

        if (!hasError) {

            if (!user) {
                setServerError("Something went wrong! Your account is not active.")
            } else {

                setSubmitDisabled(true);
                submitIdentityCleanup(dispatch, user.uid, username, displayName).then(
                    usernameOk => {
                        if (usernameOk) {
                            dispatch(authRegisterStageUpdate(REGISTER_PROVIDER_END))
                        } else {
                            setSubmitDisabled(false);
                            setUsernameError(usernameNotAvailable(username));
                        }
                    }
                ).catch(
                    error => {
                        if (error instanceof Error) {
                            console.error(error.message);
                            setServerError("An error occurred while saving your display name and username");
                        }
                    }
                )
            }

        }

    }


    return (
        <>
            <DialogContent>

                <DialogContentText sx={{marginTop: "10px", marginBottom: "20px"}}>
                    Complete your user profile by supplying a username and a display name.
                </DialogContentText>                
                           
                <Box sx={{
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "2em", 
                    minWidth: "30em",
                    marginTop: "20px"
                }}>
                    {serverError && (
                        <Box sx={{marginTop: "10px", marginBottom: "10px"}}>
                            <Alert severity='error'>
                                {serverError}
                            </Alert>
                        </Box>
                    )}
                    
                    <ZUsernameField 
                        username={username}
                        setUsername={setUsername}
                        usernameError={usernameError}
                        setUsernameError={setUsernameError}
                    />

                    <ZDisplayNameField
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        displayNameError={displayNameError}
                        setDisplayNameError={setDisplayNameError}
                    />
                    
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={anyError || submitDisabled}
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
            
        </>
    )
}

function ZRegisterProviderEnd(props: RegisterWizardCloser) {

    const {onClose} = props;
    
    return (
        <>
            <DialogContent>

                <DialogContentText sx={{marginTop: "10px", marginBottom: "20px"}}>
                    Your account is complete!
                </DialogContentText>                
                           
                
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    OK
                </Button>
            </DialogActions>
            
        </>
    )
}


interface RegisterWizardCloser {
    onClose: () => void;
}

function ZRegisterBody(props: RegisterWizardCloser) {
    const {onClose} = props;

    const stage = useAppSelector(selectRegistrationState);
    switch (stage) {
        case REGISTER_BEGIN:
            return <ZRegisterBegin onClose={onClose}/>

        case REGISTER_EMAIL:
            return <ZRegisterWithEmail/>

        case REGISTER_EMAIL_USERNAME_RETRY:
            return <ZEmailUsernameRetry/>

        case REGISTER_EMAIL_VERIFY:
            return <ZEmailVerify onClose={onClose}/>

        case REGISTER_PROVIDER_USERNAME:
            return <ZProviderUsername/>

        case REGISTER_PROVIDER_END:
            return <ZRegisterProviderEnd onClose={onClose}/>

        default:
            return null;

    }
    
}
export function ZRegisterWizard() {

    const dispatch = useAppDispatch();

    const registerStage = useAppSelector(selectRegistrationState);
    if (!registerStage) {
        return null;
    }

    function handleClose() {
        dispatch(authRegisterCancel());
    }

    const omitCloseButton = registerStage === REGISTER_PROVIDER_END;

    return (
        <Dialog open={true}>
            <ZRegisterTitle onClose={handleClose} omitCloseButton={omitCloseButton}/>
            <ZRegisterBody onClose={handleClose}/>
        </Dialog>
    )


}