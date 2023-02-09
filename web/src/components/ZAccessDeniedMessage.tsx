
import { Box, Button, Divider, Typography } from "@mui/material";
import { useContext } from "react";
import { useEntityApi } from "../fbase/hooks";
import { RegistrationContext } from "../fbase/ZRegistrationProvider";
import { authBeginSignIn } from "../model/auth";
import { REGISTER_BUTTON_LABEL, SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
interface AccessDeniedMessage {
    title: string
}
export function ZAccessDeniedMessage(props: AccessDeniedMessage) {
    const {title} = props;

    const setRegisterOpen = useContext(RegistrationContext);
    const api = useEntityApi();

    function handleSignInClick() {
        authBeginSignIn(api);
    }

    function handleRegisterClick() {
        setRegisterOpen(true);
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