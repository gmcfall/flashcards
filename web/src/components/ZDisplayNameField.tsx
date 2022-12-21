import { Box, TextField, Tooltip } from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';

const DISPLAY_NAME_HELP = (
    "Typically, this is your full name so that people will know who you are " + 
    "in real life. Use an alias if you want to remain anonymous."
)


export function validateDisplayName(displayName: string, setDisplayNameError: (value: string) => void) {
    
    const displayNameValue = displayName.trim();
    if (displayNameValue.length===0) {
        setDisplayNameError("The display name is required");
        return false;
    }
    if (displayNameValue.length<4) {
        setDisplayNameError("The display name must contain at least 4 characters")
        return false;
    }
    return true;
}

interface DisplayNameFieldProps {
    displayName: string;
    setDisplayName: (value: string) => void;
    displayNameError: string;
    setDisplayNameError: (value: string) => void;

}

export default function ZDisplayNameField(props: DisplayNameFieldProps) {
    const {displayName, setDisplayName, displayNameError, setDisplayNameError} = props;

    function handleDisplayNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        const trimmed = value.trim();
        if (displayNameError) {
            if (trimmed.length>0) {
                setDisplayNameError("");
            }
        }
        if (trimmed.length>50) {
            const fragment = trimmed.substring(0, 50);
            setDisplayName(fragment);
            return;
        }
        setDisplayName(value);
    }
    return (
        <Box sx={{display: "flex"}}>
            <TextField
                label="Display Name"
                error={Boolean(displayNameError)}
                autoComplete='off'
                variant="outlined"
                helperText={displayNameError || "Your real name or an alias. At least 4 characters and at most 50."}
                value={displayName}
                onChange={handleDisplayNameChange}
                sx={{flexGrow: 1}}
            />
            <Tooltip title={DISPLAY_NAME_HELP}>
                <HelpIcon color="primary" sx={{marginLeft: "5px"}}/>
            </Tooltip>
        </Box>
    )
}