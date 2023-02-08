import { Alert, Box, Button, TextareaAutosize, Typography } from "@mui/material";
import { useState } from "react";
import { useEntityApi } from "../fbase/hooks";
import { useSessionUser } from "../hooks/customHooks";
import { useAppDispatch } from "../hooks/hooks";
import { persistAccessRequest } from "../model/access";
import { authBeginSignIn } from "../model/auth";
import { Access, Identity } from "../model/types";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import { REGISTER_BUTTON_LABEL, SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
import { ZRegisterWizard } from "./ZRegisterWizard";
import { ZSigninWizard } from "./ZSigninWizard";

interface AlertData {
    severity: "error" | "info";
    message: string;
}

function ZRequestAccess(props: NeedAccessProps) {

    const {resourceId, access, requester} = props;

    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertData | null>(null);

    async function handleSubmit() {
        setSubmitDisabled(true);
        const textArea = document.getElementById("RequesterMessage") as HTMLTextAreaElement;
        let message = textArea?.value;
        if (message) {
            message = message.trim();
        }
        try {
            await persistAccessRequest(access.owner, resourceId, requester, message);
            setAlertData({
                severity: "info",
                message: "Your request has been sent. You will receive a notification in your Library if access is granted."
            })
        } catch (error) {
            console.log(error);
            setAlertData({
                severity: "error",
                message: "An error occurred while submitting your access request."
            })
        }
    }

    return (
        <>
            <Typography sx={{marginBottom: "20px"}}>Request access, or switch to an account with access.</Typography>

            { alertData && (
                <Alert severity={alertData.severity}>
                    {alertData.message}
                </Alert>
            )}
            {!alertData && (
                <>
                <TextareaAutosize
                    id="RequesterMessage"
                    style={{minWidth: "200px", padding: "10px"}}
                    minRows={5}
                    maxRows={10}
                    placeholder="Message (optional)"
                />
                <Box sx={{marginTop: "20px"}}>
                    <Button 
                        variant="contained"
                        disabled={submitDisabled}
                        onClick={handleSubmit}
                    >Request Access</Button>
                </Box>
                </>
            )}
        </>
    )
}

function ZMustSignIn() {
    const api = useEntityApi();
    const dispatch = useAppDispatch();
    const [, setRegisterOpen] = useState<boolean>(false);

    function handleSignInClick() {
        authBeginSignIn(api);
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
            <ZRegisterWizard/>
            <ZSigninWizard/>
            
        </>
    )
}

interface NeedAccessProps {
    resourceId: string,
    access: Access,
    requester: Identity
}
export default function ZNeedAccess(props: NeedAccessProps) {
    const {resourceId, access, requester} = props;

    const user = useSessionUser();

    if (user===undefined) {
        return (
            <Box/>
        )
    }
    const isSignedIn = Boolean(user);

    return (

            <Box sx={{display: "flex", marginTop: "100px", justifyContent: "center", width: "100%"}}>
                <Box sx={{display: "flex"}}>
                    <Box sx={{display: "flex", flexDirection: "column", marginRight: "50px"}}>
                        <Typography variant="h1">You need access</Typography>
                        {isSignedIn && <ZRequestAccess resourceId={resourceId} access={access} requester={requester}/>}
                        {!isSignedIn && <ZMustSignIn/>}
                    </Box>
                    <Box>
                        <img src="/images/goldenKey.png" alt=""/>
                    </Box>
                </Box>
            </Box>

    )
}