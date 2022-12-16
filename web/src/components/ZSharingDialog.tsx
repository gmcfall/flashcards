import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, FormControl,
    FormHelperText, MenuItem, Select, SelectChangeEvent, TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectDeck, selectDeckAccess } from "../model/deck";
import { EDITOR, Role, RoleName, VIEWER } from "../model/types";
import accessGeneralChange from "../store/actions/accessGeneralChange";
import deckNameUpdate from "../store/actions/deckNameUpdate";
import { invalidDeckName } from "./ZDeckEditorHeader";

interface SharingDialogProps {
    open: boolean;
    onClose: () => void;
}

enum SharingDialogStage {
    Begin,
    NameForm,
    ShareForm
}


interface SharingDialogNameProps {
    oldName: string;
    onNextState: () => void;
}

export function ZSharingDialogName(props: SharingDialogNameProps) {
    const {oldName, onNextState} = props;
    
    const dispatch = useAppDispatch();
    const [nameError, setNameError] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>(oldName);
    const [wasSubmitted, setWasSubmitted] = useState<boolean>(false)
   
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {

        const name = e.currentTarget.value;
        setNewName(name);
        if (wasSubmitted && invalidDeckName(name)) {
            setNameError(true)
        }
    }

    function handleSaveClick() {
        if (invalidDeckName(newName)) {
            setNameError(true);
            setWasSubmitted(true);
        } else {
            dispatch(deckNameUpdate(newName));
            onNextState();
        }
    }

    return (
        <>
            <DialogTitle>
                Name before sharing
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Give your untitled deck a name before it's shared:
                </DialogContentText>
                <TextField
                    autoFocus
                    error={nameError}
                    onChange={handleNameChange}
                    size="small"
                    id="name"
                    fullWidth
                    variant="outlined"
                    value={newName}
                    helperText={nameError ? "The name is required" : undefined}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={onNextState}
                >
                    Skip
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveClick}
                >
                    Save
                </Button>
            </DialogActions>
        </>
    )
}

const RESTRICTED="generalAccessRestricted";
const ANYONE = "generalAccessEnabled";

function generalHelperText(role: Role | undefined) {
    
    switch (role) {
        case undefined :
            return "Only you can open this deck";

        case VIEWER:
            return "Anyone on the internet with the link can view";

        case EDITOR:
            return "Anyone on the internet with the link can edit";
    }
}

interface CopyLinkButtonProps {
    showMessage: (message: string) => void
}

function ZCopyLinkButton(props: CopyLinkButtonProps) {
    const {showMessage} = props;

    if (!window.navigator) {
        return null;
    }

    function handleClick() {
        const href = window.location.href;
        const slash = href.lastIndexOf('/');
        const sharedHref = href.substring(0, slash) + "/shared";
        window.navigator.clipboard.writeText(sharedHref).then(() => {
            showMessage("Copied link")
        })
    }

    return (
        <Button 
            sx={{marginRight: "auto", marginLeft: "40px"}}
            startIcon={<LinkIcon/>}
            onClick={handleClick}
        >
            Copy link
        </Button>
    )
}

interface SharingDialogMainProps {
    resourceId: string;
    general?: Role;
    onClose: () => void;
}

export function ZSharingDialogMain(props: SharingDialogMainProps) {
    const {resourceId, general, onClose} = props;

    const dispatch = useAppDispatch();
    const [message, setMessage] = useState<string>('');
    const [messageVisible, setMessageVisible] = useState<boolean>(false);
    const generalAccessEnabled = Boolean(general);
    const generalAccessValue = generalAccessEnabled ? ANYONE : RESTRICTED;

    useEffect(() => {
        if (message) {
            setMessageVisible(true);
            setTimeout(() => {
                setMessageVisible(false)
            }, 2000);
            setTimeout(() => {
                setMessage("")
            }, 3000)
        }
    }, [message, setMessage])

    
    function handleGeneralAccessChange(event: SelectChangeEvent) {
        const targetValue = event.target.value as string;
        if (targetValue === RESTRICTED) {
            dispatch(accessGeneralChange({resourceId}))
        } else {
            dispatch(accessGeneralChange({resourceId, generalRole: VIEWER}));
        }
        
    }

    function handleGeneralRoleChange(event: SelectChangeEvent) {
        const value = event.target.value as Role;
        
        dispatch(accessGeneralChange({resourceId, generalRole: value}));
    }

    function handleDoneClick() {
        onClose();
    }

    const generalAccessIcon = (
        (general===undefined && <LockIcon/>) ||
        <PublicIcon/>
    )

    const messageDisplay = message ? "flex" : "none";
        
    return (
        <>
            <DialogTitle>
                Share this deck
            </DialogTitle>
            <DialogContent sx={{minWidth: "400px"}}>
                <DialogContentText variant="subtitle1">
                    General access
                </DialogContentText>
                <Box sx={{
                    display: "flex",
                    marginTop: "20px"
                }}>
                    <FormControl size="small">
                        <Box sx={{display: "inline-flex"}}>
                            {generalAccessIcon}
                            <Box sx={{display: "flex", flexDirection: "column", marginLeft: "5px"}}>
                                <Select 
                                    sx={{flexShrink: 3, alignSelf: "flex-start"}}
                                    size="small"
                                    value={generalAccessValue}
                                    onChange={handleGeneralAccessChange}
                                >
                                    <MenuItem value={RESTRICTED}>Restricted</MenuItem>
                                    <MenuItem value={ANYONE}>Anyone with the link</MenuItem>
                                </Select>
                                <FormHelperText>{generalHelperText(general)}</FormHelperText>
                            </Box>
                        </Box>
                    </FormControl>
                    <Box sx={{display: "inline", flexGrow: 1}}>
                    </Box>
                    {
                        generalAccessValue===ANYONE ? (
                            <FormControl sx={{marginLeft: "auto"}}>
                                <Select 
                                    size="small"
                                    value={general}
                                    onChange={handleGeneralRoleChange}
                                >
                                    <MenuItem value={VIEWER}>{RoleName[VIEWER]}</MenuItem>
                                    <MenuItem value={EDITOR}>{RoleName[EDITOR]}</MenuItem>
                                </Select>
                                <FormHelperText>Role</FormHelperText>
                            </FormControl>
                        ) : null
                    }
                </Box>
                
            </DialogContent>
            <DialogActions>
                {generalAccessEnabled && (
                    <ZCopyLinkButton showMessage={setMessage}/>
                )}
                
                <Fade in={messageVisible} timeout={500}>
                    <Box
                        sx={{
                            display: messageDisplay, 
                            flexDirection: "row",
                            alignItems: "center",
                            marginLeft: "10px",
                            color: "white",
                            background: "black",
                            flexGrow: 1,
                            alignSelf: "stretch",
                            borderTopLeftRadius: "10px",
                            borderTopRightRadius: "10px",
                        }}
                    
                    >
                        <Box sx={{
                            paddingLeft: "0.75em",
                            paddingRight: "0.75em",
                            marginRight: "auto"
                        }}>
                            {message}
                        </Box>
                    </Box>
                </Fade>
                <Button
                    variant="contained"
                    onClick={handleDoneClick}
                >
                    Done
                </Button>
            </DialogActions>
        </>
    )
}
 
export function ZSharingDialog(props: SharingDialogProps) {
    const {open, onClose} = props;
    const [dialogStage, setDialogStage] = useState<SharingDialogStage>(SharingDialogStage.Begin);


    const deck = useAppSelector(selectDeck);
    const accessEnvelope = useAppSelector(selectDeckAccess);
    
    useEffect(() => {

        const ready = (
            dialogStage === SharingDialogStage.Begin &&
            deck &&
            accessEnvelope
        );

        if (ready) {
            const nextState = invalidDeckName(deck.name) ? 
                SharingDialogStage.NameForm :
                SharingDialogStage.ShareForm;

            setDialogStage(nextState);
        }

        
    }, [dialogStage, deck, accessEnvelope])

    if (!deck || !accessEnvelope) {
        return null;
    }

    function handleNextState() {
        setDialogStage(SharingDialogStage.ShareForm);
    }

    return (
        <Dialog 
            open={open}
            onClose={onClose}
        >
        
        {
            dialogStage===SharingDialogStage.NameForm && (
                <ZSharingDialogName
                    oldName={deck.name}
                    onNextState={handleNextState}
                />
            )
        }
        {
            dialogStage===SharingDialogStage.ShareForm && (
                <ZSharingDialogMain
                    resourceId={deck.id}
                    general={accessEnvelope.payload.general}
                    onClose={onClose}
                />
            )
        }

        </Dialog>

    )
}