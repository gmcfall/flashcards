
import { Typography, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import { GOOGLE_PROVIDER_ID, Session } from "../model/types";
import ZDialogWithTitle from "./ZDialogWithTitle";
import ZGoogleIcon from "./ZGoogleIcon";
import { useState } from 'react';
import accountDeleteGoogle from "../store/actions/accountDeleteGoogle";

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

function ZSignInOptions(props: SignInOptionsProps) {
    const {session, setIsError} = props;

    const providers = session.user.providers;
    const providerId = providers.length>0 ? providers[0] : 'none';

    switch (providerId) {
        case GOOGLE_PROVIDER_ID: 
             return <ZGoogleSignIn setIsError={setIsError}/>
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