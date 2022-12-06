
import { Box, Button, TextField, Typography } from "@mui/material";
import { EmailAuthProvider, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectDeleteAccountForm } from "../model/account";
import { selectSession } from "../model/auth";
import { Session } from "../model/types";
import accountDeleteEmailChange from "../store/actions/accountDeleteEmailChange";
import accountDeleteFacebook from "../store/actions/accountDeleteFacebook";
import accountDeleteGoogle from "../store/actions/accountDeleteGoogle";
import accountDeletePasswordBegin from "../store/actions/accountDeletePasswordBegin";
import accountDeletePasswordChange from "../store/actions/accountDeletePasswordChange";
import accountDeletePasswordSubmit from "../store/actions/accountDeletePasswordSubmit";
import accountDeleteTwitter from "../store/actions/accountDeleteTwitter";
import ZDialogWithTitle from "./ZDialogWithTitle";
import ZFacebookIcon from "./ZFacebookIcon";
import ZGoogleIcon from "./ZGoogleIcon";
import ZTwitterIcon from "./ZTwitterIcon";

interface AccountDeleteConfirmProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

interface SetOpenProps {
    setOpen: (value: boolean) => void;
}

interface SignInOptionsProps {
    session: Session,
    setOpen: (value: boolean) => void;
}


function ZGoogleSignIn(props: SetOpenProps) {
    const {setOpen} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteGoogle())
        setOpen(false);
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

function ZFacebookSignIn(props: SetOpenProps) {
    const {setOpen} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteFacebook())
        setOpen(false);
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

function ZTwitterSignIn(props: SetOpenProps) {
    const {setOpen} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteTwitter())
        setOpen(false);
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

function ZReauthenticateEmail() {

    const dispatch = useAppDispatch();
    const form = useAppSelector(selectDeleteAccountForm);

    useEffect(() => {
        if (!form) {
            dispatch(accountDeletePasswordBegin())
        }
    })
    if (!form) {
        return null;
    }

    const {email, password} = form;

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(accountDeleteEmailChange(event.currentTarget.value));
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(accountDeletePasswordChange(event.currentTarget.value));
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: "2em"}}>
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
        </Box>
    )
}

function chooseProvider(session: Session) {
    
    const providers = session.user.providers;
    return providers.length>0 ? providers[0] : EmailAuthProvider.PROVIDER_ID;
}

function ZSignInOptions(props: SignInOptionsProps) {
    const {session, setOpen} = props;

    const providerId = chooseProvider(session);

    switch (providerId) {
        case GoogleAuthProvider.PROVIDER_ID:
             return <ZGoogleSignIn setOpen={setOpen}/>

        case FacebookAuthProvider.PROVIDER_ID:
            return <ZFacebookSignIn setOpen={setOpen}/>

        case TwitterAuthProvider.PROVIDER_ID:
            return <ZTwitterSignIn setOpen={setOpen}/>

        case EmailAuthProvider.PROVIDER_ID:
            return <ZReauthenticateEmail/>

        default:
            return null

    }
}

interface AccountDeleteActionsProps {
    session: Session,
    setOpen: (value: boolean) => void
}

function ZAccountDeleteActions(props: AccountDeleteActionsProps) {

    const {session, setOpen} = props;

    const dispatch = useAppDispatch();
    const form = useAppSelector(selectDeleteAccountForm);

    const providerId = chooseProvider(session);

    if (providerId !== EmailAuthProvider.PROVIDER_ID) {
        return null;
    }

    function handleCancel() {
        setOpen(false);
    }

    function handleSubmit() {
        if (form) {
            dispatch(accountDeletePasswordSubmit(form))
        }
        setOpen(false);
    }

    return (
        <Box sx={{display: 'flex', gap: "1em"}}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
        </Box>
    )

}

export default function ZAccountDeleteConfirm(props: AccountDeleteConfirmProps) {
    const {open, setOpen} = props;

    const session = useAppSelector(selectSession);
    if (!session) {
        return null;
    }
    const actions = <ZAccountDeleteActions session={session} setOpen={setOpen}/>

    if (!open) {
        return null;
    }

    return (
        <ZDialogWithTitle
            title="Delete Account"
            open={open}
            setOpen={setOpen}
            actions={actions}
        >
            <Typography gutterBottom>
                For security reasons, please sign in again before we delete your account.
            </Typography>
            <ZSignInOptions session={session} setOpen={setOpen}/>
        </ZDialogWithTitle>
    )
     
}