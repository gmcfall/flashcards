
import { Box, Typography, Button, Divider } from "@mui/material";
import { useAppDispatch } from "../hooks/hooks";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import authSigninBegin from "../store/actions/authSigninBegin";
import { REGISTER_BUTTON_LABEL, SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
interface AccessDeniedMessage {
    title: string
}
export function ZAccessDeniedMessage(props: AccessDeniedMessage) {
    const {title} = props;

    const dispatch = useAppDispatch();

    function handleSignInClick() {
        dispatch(authSigninBegin())
    }

    function handleRegisterClick() {
        dispatch(authRegisterBegin());
    }

    return (
       <Box>
            <Typography variant="subtitle1">{title}</Typography>
            <Divider/>
            <Box sx={{marginTop: "1em"}}>
                <Typography display="inline">If you have an account, please</Typography>
                <Button 
                    variant="text"
                    onClick={handleSignInClick}
                >
                    {SIGN_IN_BUTTON_LABEL}
                </Button>
                <Typography display="inline">.</Typography>
            </Box>
            <Box>
                <Typography display="inline">Otherwise,</Typography>
                <Button
                    variant="text"
                    onClick={handleRegisterClick}
                >
                    {REGISTER_BUTTON_LABEL}
                </Button>
            </Box>

       </Box>
    )

}