import { Alert, Box } from "@mui/material";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import { useEntityApi } from "../fbase/hooks";
import { updateUserProfile } from "../model/auth";
import { ANONYMOUS, SessionUser } from "../model/types";
import ZDisplayNameField, { validateDisplayName } from "./ZDisplayNameField";
import ZUsernameField, { usernameNotAvailable, validateUsername } from "./ZUsernameField";


function usernameValue(user: SessionUser) {
    const username = user.username;
    return (username===ANONYMOUS ? "" : username);
}

function usernameErrorValue(user: SessionUser) {
    const username = user.username;
    return (username===ANONYMOUS ? "The username is required" : "");
}

interface UserProfileFormProps {
    user: SessionUser;
    onClose?: () => void;
}

export default function ZUserProfileForm(props: UserProfileFormProps) {
    const {user, onClose} = props;

    const api = useEntityApi();
    const [username, setUsername] = useState<string>(usernameValue(user));
    const [usernameError, setUsernameError] = useState<string>(usernameErrorValue(user));
    const [displayName, setDisplayName] = useState<string>(user.displayName);
    const [displayNameError, setDisplayNameError] = useState<string>("");
    const [serverError, setServerError] = useState<string>("");
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

    function handleSubmit() {
        let hasError = false;
        
        hasError = !validateUsername(username, setUsernameError) || hasError;
        hasError = !validateDisplayName(displayName, setDisplayNameError) || hasError;

        if (!hasError) {
            setSubmitDisabled(true);
            updateUserProfile(api, user, {username, displayName}).then(
                usernameOk => {
                    if (!usernameOk) {
                        setSubmitDisabled(false);
                        setUsernameError(usernameNotAvailable(username));
                    } else if (onClose) {
                        onClose();
                    }
                }
            ).catch(
                error => {
                    if (error instanceof Error) {
                        console.error(error.message);
                        setServerError("An error occurred while saving your display name and username");
                    }
                }
            )
        }
    }

    const anyError = Boolean(
        displayNameError || usernameError
    )
    return (
        <>
            <DialogContent>
                <Box sx={{
                    display: "flex",
                    marginTop: "0.5rem",
                    flexDirection: "column",
                    gap: "2em"
                }}>
                    {serverError && (
                        <Box sx={{marginTop: "10px", marginBottom: "10px"}}>
                            <Alert severity='error'>
                                {serverError}
                            </Alert>
                        </Box>
                    )}
                    <ZUsernameField 
                        username={username}
                        setUsername={setUsername}
                        usernameError={usernameError}
                        setUsernameError={setUsernameError}
                    />
                    <ZDisplayNameField
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        displayNameError={displayNameError}
                        setDisplayNameError={setDisplayNameError}
                    />

                </Box>
            </DialogContent>
            <DialogActions>
                {onClose && (
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                )}
                <Button
                    variant="contained"
                    disabled={anyError || submitDisabled}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
        </>
    )
}