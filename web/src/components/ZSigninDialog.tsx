import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSigninState } from "../model/auth";
import authSigninCancel from "../store/actions/authSigninCancel";
import authSigninGoogle from "../store/actions/authSigninGoogle";
import ZDialogWithTitle from "./ZDialogWithTitle";
import { Button, Box } from "@mui/material";
import ZGoogleIcon from "./ZGoogleIcon";
import ZFacebookIcon from "./ZFacebookIcon";
import ZTwitterIcon from "./ZTwitterIcon";
import EmailIcon from '@mui/icons-material/Email';
import { SIGNIN_BEGIN } from "../model/types";
import { dialogContentStyle } from "./ZRegisterDialog";
import authSigninFacebook from "../store/actions/authSigninFacebook";
import authSigninTwitter from "../store/actions/authSigninTwitter";



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
                <Button startIcon={<EmailIcon/>}>
                    Sign in with email and password
                </Button>
            </Box>

        </Box>

    )

}

export default function ZSigninDialog() {

    const dispatch = useAppDispatch();
    const signinState = useAppSelector(selectSigninState);

    if (!signinState) {
        return null;
    }

    function setOpen(value: boolean) {
        if (!value) {
            dispatch(authSigninCancel());
        }
    }

    return (
        <ZDialogWithTitle
            open={true}
            title="Sign in"
            setOpen={setOpen}
        >
            {
                (signinState===SIGNIN_BEGIN && <ZSigninStart/>)
            }
        </ZDialogWithTitle>
    );
}