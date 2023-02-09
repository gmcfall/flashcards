
import EmailIcon from '@mui/icons-material/Email';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { useState } from 'react';
import { useEntityApi } from "../fbase/hooks";
import { useSessionUser } from "../hooks/customHooks";
import { deleteAccountViaEmailProvider, deleteAccountViaIdentityProvider } from "../model/auth";
import { SessionUser } from "../model/types";
import ZFacebookIcon from "./ZFacebookIcon";
import ZGoogleIcon from "./ZGoogleIcon";
import ZTwitterIcon from "./ZTwitterIcon";

interface AccountDeleteConfirmProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

interface ProviderButtonProps {
    onClose: () => void;
}


function ZContinueWithGoogle(props: ProviderButtonProps) {
    const {onClose} = props;
    const api = useEntityApi();

    function handleProceed() {
        deleteAccountViaIdentityProvider(api, new GoogleAuthProvider());
        onClose();
    }
    return (
        <Button
            startIcon={<ZGoogleIcon/>} sx={{height: '2em'}}
            onClick={handleProceed}
        >
            Continue with Google
        </Button>
   )
}


interface ContinueWithEmailProps {
    setDialogState: (value: DeleteAccountState) => void
}

function ZContinueWithEmail(props: ContinueWithEmailProps) {
    const {setDialogState} = props;

    function handleClick() {
        setDialogState('EmailPassword');
    }

    return (
        <Button
            startIcon={<EmailIcon/>}
            onClick={handleClick}
        >
            Continue with Email and Password
        </Button>
    )

}

function ZContinueWithFacebook(props: ProviderButtonProps) {
    const {onClose} = props;
    const api = useEntityApi();

    function handleProceed() {
        deleteAccountViaIdentityProvider(api, new FacebookAuthProvider());
        onClose();
    }
    return (
        <Button
            startIcon={<ZFacebookIcon/>}
            onClick={handleProceed}
        >
            Continue with Facebook
        </Button>
   )
}

function ZContinueWithTwitter(props: ProviderButtonProps) {
    const {onClose} = props;
    const api = useEntityApi();

    function handleProceed() {
        deleteAccountViaIdentityProvider(api, new TwitterAuthProvider());
        onClose();
    }
    return (
        <Button
            startIcon={<ZTwitterIcon/>}
            onClick={handleProceed}
        >
            Continue with Twitter
        </Button>
   )
}

interface EmailPasswordFormProps {
    onClose: () => void;
    showInstructions: boolean;
}

function ZEmailPasswordForm(props: EmailPasswordFormProps) {

    const {onClose, showInstructions} = props;
    
    const api = useEntityApi();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.currentTarget.value);
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPassword(event.currentTarget.value);
    }

    function handleSubmit() {
        deleteAccountViaEmailProvider(api, email, password).then(
            () => onClose()
        )
    }

    return (
        <>
            {showInstructions && (
                <ZDeleteAccountInstructions/>
            )}
            <TextField sx={{marginTop: "2em"}}
                label="Email"
                value={email}
                onChange={handleEmailChange}
            />
            <TextField
                label="Password"
                value={password}
                type="password"
                onChange={handlePasswordChange}
            />
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </>
    )
}

export default function ZAccountDeleteConfirm(props: AccountDeleteConfirmProps) {
    const {open, setOpen} = props;

    const [dialogState, setDialogState] = useState<DeleteAccountState>("ChooseProvider");

    const user = useSessionUser();
    if (!user || !open) {
        return null;
    }

    function handleClose() {
        setOpen(false);
    }

    const providers = user.providers;
    const onlyEmail = providers.length===1 && providers[0]===EmailAuthProvider.PROVIDER_ID;

    const state: DeleteAccountState = onlyEmail ? "EmailPassword" : dialogState;

    return (
        <Dialog open={true} onClose={handleClose}>
            <DialogTitle>Delete Account</DialogTitle>
            {state === "EmailPassword" ? (
                <ZEmailPasswordForm 
                    showInstructions={onlyEmail}
                    onClose={handleClose}
                />
            ) : (
                <ZChooseProvider
                    onClose={handleClose}
                    setDialogState={setDialogState}
                    user={user}
                />
            )}
        </Dialog>

    )
     
}

type DeleteAccountState = 'ChooseProvider' | 'EmailPassword';

interface ChooseProviderProps {
    user: SessionUser;
    onClose: () => void;
    setDialogState: (value: DeleteAccountState) => void;
}

function ZDeleteAccountInstructions() {
    return (
        
        <DialogContentText sx={{marginBottom: "1rem"}}>
            For security reasons, please sign in again before we delete your account.
        </DialogContentText>
    )
}

function ZChooseProvider(props: ChooseProviderProps) {
    const {user, setDialogState, onClose} = props;
    
    return (
        <>
            <DialogContent>
                <ZDeleteAccountInstructions/>
                
                {user.providers.includes(GoogleAuthProvider.PROVIDER_ID) && (
                    <ZContinueWithGoogle onClose={onClose}/>
                )}
                {user.providers.includes(FacebookAuthProvider.PROVIDER_ID) && (
                    <ZContinueWithFacebook onClose={onClose}/>
                )}
                {user.providers.includes(TwitterAuthProvider.PROVIDER_ID) && (
                    <ZContinueWithTwitter onClose={onClose}/>
                )}
                {user.providers.includes(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) && (
                    <ZContinueWithEmail setDialogState={setDialogState}/>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </>
    )

}