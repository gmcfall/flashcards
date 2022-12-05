
import { Button, Typography } from "@mui/material";
import { FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import { Session } from "../model/types";
import accountDeleteFacebook from "../store/actions/accountDeleteFacebook";
import accountDeleteGoogle from "../store/actions/accountDeleteGoogle";
import accountDeleteTwitter from "../store/actions/accountDeleteTwitter";
import ZDialogWithTitle from "./ZDialogWithTitle";
import ZFacebookIcon from "./ZFacebookIcon";
import ZGoogleIcon from "./ZGoogleIcon";
import ZTwitterIcon from "./ZTwitterIcon";

interface AccountDeleteConfirmProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

interface SignInOptionsProps {
    session: Session,
    setIsError: (value: boolean) => void
}

interface ReauthenticateProps {
    setIsError: (value: boolean) => void
}

function ZGoogleSignIn(props: ReauthenticateProps) {
    const {setIsError} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteGoogle(setIsError))
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

function ZFacebookSignIn(props: ReauthenticateProps) {
    const {setIsError} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteFacebook(setIsError))
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

function ZTwitterSignIn(props: ReauthenticateProps) {
    const {setIsError} = props;
    const dispatch = useAppDispatch();

    function handleProceed() {
        dispatch(accountDeleteTwitter(setIsError))
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


function ZSignInOptions(props: SignInOptionsProps) {
    const {session, setIsError} = props;

    const providers = session.user.providers;
    const providerId = providers.length>0 ? providers[0] : 'none';

    switch (providerId) {
        case GoogleAuthProvider.PROVIDER_ID: 
             return <ZGoogleSignIn setIsError={setIsError}/>

        case FacebookAuthProvider.PROVIDER_ID:
            return <ZFacebookSignIn setIsError={setIsError}/>

        case TwitterAuthProvider.PROVIDER_ID:
            return <ZTwitterSignIn setIsError={setIsError}/>
    }

    return null;
}

export default function ZAccountDeleteConfirm(props: AccountDeleteConfirmProps) {
    const {open, setOpen} = props;
    const [isError, setIsError] = useState<boolean>(false);

    const session = useAppSelector(selectSession);
    return (
        <ZDialogWithTitle
            title="Delete Account"
            open={open}
            setOpen={setOpen}
        >
            {!isError && session ? (
                <>
                <Typography gutterBottom>
                    For security reasons, please sign in again before we delete your account.
                </Typography>
                <ZSignInOptions session={session} setIsError={setIsError}/>
                </>
            ) : (
                <Typography gutterBottom>
                    Oops! Something went wrong.  Try signing out and signing back in again.
                </Typography>
            )}
        </ZDialogWithTitle>
    )
     
}