import EmailIcon from '@mui/icons-material/Email';
import { Box, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectRegistrationState } from "../model/auth";
import { REGISTER_BEGIN } from "../model/types";
import authRegisterFacebook from '../store/actions/authRegisterFacebook';
import authRegisterGoogle from "../store/actions/authRegisterGoogle";
import authRegisterTwitter from '../store/actions/authRegisterTwitter';
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
                <Button startIcon={<EmailIcon/>}>
                    Create an account with Email and Password
                </Button>

            </Box>

        </Box>

    )

}

interface RegisterDialogProps {
    setOpen: (value: boolean) => void;
}

export default function ZRegisterDialog(props: RegisterDialogProps) {
    const {setOpen} = props;

    const registerState = useAppSelector(selectRegistrationState);

    // Don't show the modal if `registerState` is undefined
    if (!registerState) {
        return null;
    }

    return (
        <ZDialogWithTitle 
            open={true}
            title="Create an Account"
            setOpen={setOpen}
        >
            {
                (registerState===REGISTER_BEGIN && <ZRegisterStart/>)
            }
        </ZDialogWithTitle>
    )


}