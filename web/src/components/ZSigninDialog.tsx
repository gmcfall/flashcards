import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectPasswordSigninForm, selectSigninState } from "../model/auth";
import authSigninCancel from "../store/actions/authSigninCancel";
import authSigninGoogle from "../store/actions/authSigninGoogle";
import ZDialogWithTitle from "./ZDialogWithTitle";
import { Button, Box, TextField } from "@mui/material";
import ZGoogleIcon from "./ZGoogleIcon";
import ZFacebookIcon from "./ZFacebookIcon";
import ZTwitterIcon from "./ZTwitterIcon";
import EmailIcon from '@mui/icons-material/Email';
import { SigninState, SIGNIN_BEGIN, SIGNIN_PASSWORD } from "../model/types";
import { dialogContentStyle } from "./ZRegisterDialog";
import authSigninFacebook from "../store/actions/authSigninFacebook";
import authSigninTwitter from "../store/actions/authSigninTwitter";
import authSigninPasswordBegin from "../store/actions/authSigninPasswordBegin";
import React from "react";
import authSigninPasswordChangeEmail from "../store/actions/authinSigninPasswordChangeEmail";
import authSigninPasswordChangePassword from "../store/actions/authSigninPasswordChangePassword";
import authSigninPasswordSubmit from "../store/actions/authSigninPasswordSubmit";



function ZSigninStart() {

    const dispatch = useAppDispatch();

    function handleGoogleClick() {
        dispatch(authSigninGoogle());
    }

    function handleFacebookClick() {
        dispatch(authSigninFacebook());
    }

    function handleTwitterClick() {
        dispatch(authSigninTwitter());
    }

    function handlePasswordClick() {
        dispatch(authSigninPasswordBegin())
    }

    return (
        <Box sx={{display: "flex", flexDirection: 'column'}}>

            <Box sx={dialogContentStyle}>
                <Button
                    startIcon={<ZGoogleIcon/>} sx={{height: '2em'}}
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
                    onClick={handlePasswordClick}
                >
                    Sign in with email and password
                </Button>
            </Box>

        </Box>

    )

}

interface SigninContentProps {
    state: SigninState
}

function ZSigninPasswordForm() {

    const dispatch = useAppDispatch();
    const form = useAppSelector(selectPasswordSigninForm);
    if (!form) {
        return null;
    }
    const {email, password} = form;

    function handleChangeEmail(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(authSigninPasswordChangeEmail(event.currentTarget.value));
    }

    function handleChangePassword(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch(authSigninPasswordChangePassword(event.currentTarget.value));
    }

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "2em", minWidth: '30em', padding: "2em"}}>
            <TextField
                variant="outlined"
                label="Email"
                value={email}
                onChange={handleChangeEmail}
            />
            <TextField
                variant="outlined"
                label="Password"
                type="password"
                value={password}
                onChange={handleChangePassword}
            />
        </Box>
    )
}

function ZSigninContent(props: SigninContentProps) {
    const {state} = props;

    switch (state) {
        case SIGNIN_BEGIN:
            return <ZSigninStart/>

        case SIGNIN_PASSWORD:
            return <ZSigninPasswordForm/>

        default:
            return null;
    }
}

interface SigninPasswordActionsProps {
    setOpen: (value: boolean) => void
}

function ZSigninPasswordActions(props: SigninPasswordActionsProps) {
    const {setOpen} = props;

    const dispatch = useAppDispatch();
    const credentials = useAppSelector(selectPasswordSigninForm);

    function handleCancel() {
        setOpen(false);
    }

    function handleSubmit() {
        if (credentials) {
            dispatch(authSigninPasswordSubmit(credentials))
        }
    }

    return (
        <Box>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
        </Box>
    );
}

interface SigninActionsProps {
    state: SigninState,
    setOpen: (value: boolean) => void
}

function ZSigninActions(props: SigninActionsProps) {
    const {state, setOpen} = props;

    switch(state) {
        case SIGNIN_PASSWORD:
            return <ZSigninPasswordActions setOpen={setOpen}/>

        default:
            return null;
    }
}

interface SigninDialogProps {
    /**
     * An optional callback that fires when the dialog closes
     */
    onClose?: () => void
}

export default function ZSigninDialog(props: SigninDialogProps) {
    const {onClose} = props;
    const dispatch = useAppDispatch();
    const signinState = useAppSelector(selectSigninState);

    if (!signinState) {
        return null;
    }

    function setOpen(value: boolean) {
        if (!value) {
            dispatch(authSigninCancel());
            if (onClose) {
                onClose();
            }
        }
    }

    const actions = <ZSigninActions state={signinState} setOpen={setOpen}/>

    return (
        <ZDialogWithTitle
            open={true}
            title="Sign in"
            setOpen={setOpen}
            actions={actions}
        >
            <ZSigninContent state={signinState}/>
        </ZDialogWithTitle>
    );
}