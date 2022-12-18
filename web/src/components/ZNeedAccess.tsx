import { Box, Typography, TextareaAutosize, Button } from "@mui/material";
import { useSession } from "../hooks/customHooks";
import { useAppDispatch } from "../hooks/hooks";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import authSigninBegin from "../store/actions/authSigninBegin";
import { REGISTER_BUTTON_LABEL, SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
import ZRegisterDialog from "./ZRegisterDialog";
import { useState } from "react";
import ZSigninDialog from "./ZSigninDialog";


function ZRequestAccess() {
    return (
        <>
            <Typography sx={{marginBottom: "20px"}}>Request access, or switch to an account with access.</Typography>
            <TextareaAutosize
                style={{minWidth: "200px", padding: "10px"}}
                minRows={5}
                maxRows={10}
                placeholder="Message (optional)"
            />
            <Box sx={{marginTop: "20px"}}>
                <Button variant="contained">Request Access</Button>
            </Box>
        </>
    )
}

function ZMustSignIn() {
    
    const dispatch = useAppDispatch();
    const [registerOpen, setRegisterOpen] = useState<boolean>(false);

    function handleSignInClick() {
        dispatch(authSigninBegin())
    }

    function handleRegisterClick() {
        setRegisterOpen(true);
        dispatch(authRegisterBegin());
    }

    return (
        <>
            <Typography>
                To gain access, you must be signed in.
            </Typography>
            <Box sx={{marginTop: "20px"}}>
                <Typography display="inline">
                    If you have an account, please
                </Typography>
                <Button onClick={handleSignInClick}>{SIGN_IN_BUTTON_LABEL}</Button>
            </Box>
            <Box>
                <Typography display="inline">
                    Otherwise,
                </Typography>
                <Button onClick={handleRegisterClick}>{REGISTER_BUTTON_LABEL}</Button>
            </Box>
            <ZRegisterDialog setOpen={setRegisterOpen} disableCancel={true}/>
            <ZSigninDialog/>
            
        </>
    )
}

export default function ZNeedAccess() {

    const session = useSession();

    if (!session) {
        return (
            <Box/>
        )
    }
    const isSignedIn = Boolean(session.user);

    return (

            <Box sx={{display: "flex", marginTop: "100px", justifyContent: "center", width: "100%"}}>
                <Box sx={{display: "flex"}}>
                    <Box sx={{display: "flex", flexDirection: "column", marginRight: "50px"}}>
                        <Typography variant="h1">You need access</Typography>
                        {isSignedIn && <ZRequestAccess/>}
                        {!isSignedIn && <ZMustSignIn/>}
                    </Box>
                    <Box>
                        <img src="/images/goldenKey.png" alt=""/>
                    </Box>
                </Box>
            </Box>

    )
}