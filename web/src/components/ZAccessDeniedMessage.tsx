
import { Box, Typography, Button, Divider } from "@mui/material";
import { useAppDispatch } from "../hooks/hooks";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import authSigninBegin from "../store/actions/authSigninBegin";
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
                    Sign in
                </Button>
                <Typography display="inline">.</Typography>
            </Box>
            <Box>
                <Typography display="inline">Otherwise,</Typography>
                <Button
                    variant="text"
                    onClick={handleRegisterClick}
                >
                    Register
                </Button>
                <Typography display="inline">to create an account.</Typography>
            </Box>

       </Box>
    )

}