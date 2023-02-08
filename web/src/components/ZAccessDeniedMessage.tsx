
import { Box, Button, Divider, Typography } from "@mui/material";
import { useEntityApi } from "../fbase/hooks";
import { useAppDispatch } from "../hooks/hooks";
import { authBeginSignIn } from "../model/auth";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import { REGISTER_BUTTON_LABEL, SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
interface AccessDeniedMessage {
    title: string
}
export function ZAccessDeniedMessage(props: AccessDeniedMessage) {
    const {title} = props;

    const dispatch = useAppDispatch();
    const api = useEntityApi();

    function handleSignInClick() {
        authBeginSignIn(api);
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