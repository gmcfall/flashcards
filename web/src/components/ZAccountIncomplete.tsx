import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useEntityApi } from "@gmcfall/react-firebase-state";
import { useSessionUser } from "../hooks/customHooks";
import { authSignOut, resendEmailVerification, startEmailVerificationListener, stopEmailVerificationListener, userProfileIsIncomplete } from "../model/auth";
import { HasUser } from "./lerniCommon";
import LerniTheme from "./lerniTheme";
import ZAccountDeleteConfirm from "./ZAccountDeleteConfirm";
import ZUserProfileForm from "./ZUserProfileForm";



const PMARGIN = "0.75rem";

function ZVerifyEmail(props: HasUser) {
    const {user} = props;
    
    const api = useEntityApi();
    const requiresVerification = user.requiresEmailVerification;

    useEffect(() => {
        if (requiresVerification) {
            startEmailVerificationListener(api);
        } else {
            stopEmailVerificationListener();
        }

        return () => {
            stopEmailVerificationListener();
        }
    }, [requiresVerification, api])

    if (!requiresVerification) {
        return null;
    }

    return (
        <Box>
            <Typography variant="subtitle1">You must verify your email</Typography>
            <Typography>
                We sent you an email with a link that you must click to verify your
                email.
            </Typography>
            <Typography sx={{marginTop: PMARGIN}}>
                If you don't see that email in your inbox, check your spam folder.
            </Typography>
            <Typography sx={{marginBottom: "1rem"}}>
                If you still can't find the email, we can send it again.
            </Typography>
            <Button 
                variant="contained"
                onClick={resendEmailVerification}
            >
                Resend the Email Verification Link
            </Button>
        </Box>
    )
}

function ZCompleteProfile(props: HasUser) {
    const {user} = props;

    

    if (!userProfileIsIncomplete(user)) {
        return null;
    }

    return (
        <Box>
            <Typography variant="subtitle1" sx={{marginBottom: "1rem"}}>You must complete your profile</Typography>
            <Box sx={{
                borderStyle: "solid",
                borderColor: LerniTheme.dividerColor,
                borderWidth: "1px",
                padding: "2rem",
                borderRadius: "10px"

            }}>
                <ZUserProfileForm user={user}/>
            </Box>
        </Box>
    )

}

function ZOtherActions() {
    const api = useEntityApi();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    
    function handleSignOut() {
        authSignOut(api);
    }
    
    function handleDeleteAccount() {
        setConfirmDeleteOpen(true);
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            marginTop: "2rem"
        }}>
            <Typography variant="subtitle1">Other possible actions:</Typography>
            <Box>
                <Button
                    variant="outlined"
                    onClick={handleSignOut}
                >
                    Sign out
                </Button>
            </Box>
            <Box>
                <Button
                    variant="outlined"
                    onClick={handleDeleteAccount}
                >
                    Delete Account
                </Button>
            </Box>
            <ZAccountDeleteConfirm
                open={confirmDeleteOpen}
                setOpen={setConfirmDeleteOpen}
            />

        </Box>
    )
}

export default function ZAccountIncomplete() {

    const user = useSessionUser();
    if (!user) {
        return null;
    }

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            gap: "50px",
            marginTop: "50px"            
        }}>
            <img width="100" height="100" src="/images/hand_stop_sign.svg" alt=""/>
            <Box>
                <Typography variant="h1" sx={{marginBottom: "1em"}}>Your Account is incomplete</Typography>
                <ZVerifyEmail user={user}/>
                <ZCompleteProfile user={user}/>
                <ZOtherActions/>
            </Box>
        </Box>
    )
}