import EmailIcon from '@mui/icons-material/Email';
import { Alert, Box, Button, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectRegistrationState } from "../model/auth";
import { RegisterStage, REGISTER_BEGIN, REGISTER_EMAIL, REGISTER_EMAIL_VERIFY } from "../model/types";
import authRegisterFacebook from '../store/actions/authRegisterFacebook';
import authRegisterGoogle from "../store/actions/authRegisterGoogle";
import authRegisterStageUpdate from '../store/actions/authRegisterStageUpdate';
import authRegisterTwitter from '../store/actions/authRegisterTwitter';
import authSigninBegin from '../store/actions/authSigninBegin';
import ZDialogWithTitle from './ZDialogWithTitle';
import ZFacebookIcon from "./ZFacebookIcon";
import ZGoogleIcon from "./ZGoogleIcon";
import ZTwitterIcon from "./ZTwitterIcon";


export const dialogContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '1em',
    padding: '2em',
}


function ZRegisterStart() {

    const dispatch = useAppDispatch();

    function handleGoogleClick() {
        dispatch(authRegisterGoogle());
    }

    function handleFacebookClick() {
        dispatch(authRegisterFacebook());
    }

    function handleTwitterClick() {
        dispatch(authRegisterTwitter());
    }

    function handleEmailClick() {
        dispatch(authRegisterStageUpdate(REGISTER_EMAIL));
    }

    return (
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

    )
}



interface SetOpenAsProps {
    setOpen: (value: boolean) => void
}


function ZOkButton(props: SetOpenAsProps) {
    const {setOpen} = props;
    function handleClick() {
        setOpen(false);
    }

    return (
        <Button onClick={handleClick}>Ok</Button>
    )
}

interface DialogActionsProps {
    state: RegisterStage,
    setOpen: (value: boolean) => void
}

function ZRegisterBeginActions(props: SetOpenAsProps) {
    const {setOpen} = props;
    const dispatch = useAppDispatch();

    function handleSignIn() {
        setOpen(false);
        dispatch(authSigninBegin());
    }
    return (
        <Box sx={{display: "flex", alignItems: "baseline"}}>
            <Typography>Already have an account?</Typography>
            <Typography sx={{marginLeft: '1em'}}>You can</Typography>
            <Button onClick={handleSignIn}>Sign in</Button>
        </Box>
    )
}

function ZDialogActions(props: DialogActionsProps) {
    const {state, setOpen} = props;

    switch (state) {
        case REGISTER_BEGIN: 
            return <ZRegisterBeginActions setOpen={setOpen}/>

        case REGISTER_EMAIL_VERIFY:
            return <ZOkButton setOpen={setOpen}/>

        default:
            return null;
    }
}

function ZRegisterEmailVerifyAnnounce() {
    return (
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
                </Box>
            </Alert>
        </Box>
    )
}

interface RegisterDialogProps {
    setOpen: (value: boolean) => void,

    /**
     * When true, the dialog will not render a cancel button in the header
     * and it will not be possible to close the dialog by clicking the background
     * or pressing [Esc].
     */
    disableCancel?: boolean
}


function dialogContent(state: RegisterStage) {
    switch (state) {
        case REGISTER_BEGIN:
            return <ZRegisterStart/>

        case REGISTER_EMAIL_VERIFY:
            return <ZRegisterEmailVerifyAnnounce/>

        default:
            return null;
    }
}

export default function ZRegisterDialog(props: RegisterDialogProps) {
    const {setOpen, disableCancel} = props;

    const registerState = useAppSelector(selectRegistrationState);
    if (!registerState) {
        return null;
    }

    const actions = (
        <ZDialogActions
            state={registerState}
            setOpen={setOpen}
        />
    )


    return (
        <ZDialogWithTitle 
            open={true}
            title="Create an Account"
            setOpen={disableCancel ? undefined : setOpen}
            actions={actions}
        >
           {dialogContent(registerState)}
        </ZDialogWithTitle>
    )
}