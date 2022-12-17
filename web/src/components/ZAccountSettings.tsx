import ZDialogWithTitle from "./ZDialogWithTitle";
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectCurrentUser } from "../model/auth";
import React, { useState } from 'react';
import accountDisplayNameUpdate from "../store/actions/accountDisplayNameUpdate";

interface AccountSettingsProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function ZAccountSettings(props: AccountSettingsProps) {
    const {open, setOpen} = props;

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);

    const [displayName, setDisplayName] = useState<string>(
        user?.displayName || 'Anonymous'
    )

    function handleSaveChanges() {
        setOpen(false);
        dispatch(accountDisplayNameUpdate(displayName));
    }

    const actions = (
        <Button onClick={handleSaveChanges}>Save Changes</Button>
    )

    function handleDisplayNameChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const value = event.currentTarget.value;
        setDisplayName(value);
    }

    return (
        <ZDialogWithTitle
            title="Account Settings"
            open={open}
            setOpen={setOpen}
            actions={actions}
        >
            <DialogContentText sx={{marginBottom: "2rem"}}>
                Your display name will appear on decks shared with other people.
                You can set it to your real name or an alias.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="displayName"
                label="Display Name"
                fullWidth
                variant="outlined"
                value={displayName}
                onChange={handleDisplayNameChange}
            />

        </ZDialogWithTitle>
    )
}