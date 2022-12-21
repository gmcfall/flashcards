import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { checkUsernameAvailability } from "../model/identity";
import { ANONYMOUS } from "../model/types";
import { toUsername } from "./lerniCommon";

import HelpIcon from '@mui/icons-material/Help';

const USERNAME_HELPER_TEXT = "Maximum of 15 characters. Letters, numbers and underscores only.";


const USERNAME_TIP = (
    "A short handle that uniquely identifies you in the Lerni app. " +
    "People reference each other with usernames. For example, the owner of " +
    "a deck may invite you to collaborate by submitting your username. " +
    "Usernames always start with the '@' symbol."
)

export function usernameNotAvailable(username: string) {
    return `The username "@${username}" is not available`
}

export function usernameIsAvailable(username: string) {
    return `The username "@${username}" is available`
}

export function validateUsername(username: string, setUsernameError: (value: string) => void) {

    const usernameValue = username.trim();
    if (usernameValue.length===0) {
        setUsernameError("The username is required")
        return false;
    }
    if (usernameValue===ANONYMOUS) {
        setUsernameError(usernameNotAvailable(username));
    }

    return true;
}

interface UsernameFieldProps {
    username: string,
    setUsername: (value: string) => void;
    usernameError: string;
    setUsernameError: (value: string) => void;
    
}

export default function ZUsernameField(props: UsernameFieldProps) {
    const {username, setUsername, usernameError, setUsernameError} = props;
    const [usernameAvailable, setUsernameAvailable] = useState<string>("");
    

    function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        const validated = toUsername(value);

        if (validated === ANONYMOUS) {
            setUsernameError(usernameNotAvailable(validated));
        } else if (usernameError && validated.length>0) {
            setUsernameError("");
        }       
        setUsername(validated);
        setUsernameAvailable("");
    }

    function handleCheckUsernameAvailability() {
        if (username.length===0) {
            setUsernameError("The username must be defined")
        } else if (username === ANONYMOUS) {
            setUsernameError(usernameNotAvailable(username));
        } else {
            checkUsernameAvailability(username).then(result => {
                setUsernameAvailable(result ? "true" : "false");
            }).catch(error => {
                setUsernameError("An error occurred while checking availability");
                if (error instanceof Error) {
                    console.error(error.message);
                }
            })
        }
    }
    return (
        
        <Box sx={{display: "flex", position: "relative"}}>
            <Typography 
                component="span"
                sx={{position: "relative", top: "15px", marginRight: "5px"}}
            >
                @
            </Typography>
            <TextField
                label="Username"
                color={usernameAvailable ? "success": undefined}
                error={Boolean(usernameError || usernameAvailable==="false")}
                variant="outlined"
                autoComplete='off'
                helperText={
                    usernameError || 
                    (usernameAvailable === "true" && usernameIsAvailable(username)) ||
                    (usernameAvailable === "false" && usernameNotAvailable(username)) ||
                    USERNAME_HELPER_TEXT
                }
                value={username}
                onChange={handleUsernameChange}
                sx={{flexGrow: 1}}
            />
            <Tooltip title={USERNAME_TIP}>
                <HelpIcon color="primary" sx={{marginLeft: "5px"}}/>
            </Tooltip>
            <Button
                onClick={handleCheckUsernameAvailability}
                sx={{alignSelf: "flex-start"}}>
                    Check availability
            </Button>
        </Box>
    )
}