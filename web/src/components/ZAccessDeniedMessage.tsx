
import { Box, Typography, Button, Divider } from "@mui/material";
import { useAppDispatch } from "../hooks/hooks";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import authSigninBegin from "../store/actions/authSigninBegin";
interface AccessDeniedMessage {
    resourceName: string,
    determiner?: string
}
export function ZAccessDeniedMessage(props: AccessDeniedMessage) {
    const {resourceName, determiner} = props;

    const dispatch = useAppDispatch();

    const determinerValue = determiner || "the";

    function handleSignInClick() {
        dispatch(authSigninBegin())
    }

    function handleRegisterClick() {
        dispatch(authRegisterBegin());
    }

    return (
       <Box>
            <Typography variant="subtitle1">You must be signed in to access {determinerValue} {resourceName}</Typography>
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