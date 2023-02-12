import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fade, FormControl,
    FormHelperText, IconButton, InputBase, Menu, MenuItem, Select, SelectChangeEvent, TextField, Tooltip, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { disownAllLeases } from '../fbase/functions';
import { useEntityApi } from '../fbase/hooks';
import { useIdentity, useSessionUser } from '../hooks/customHooks';
import { changeCollaboratorRole, createIdentityRole, injectCollaborators, removeAcess, updateGeneralRole } from '../model/access';
import { alertError } from '../model/alert';
import { updateDeckName } from '../model/deck';
import { createIdentity, getIdentityByUsername } from '../model/identity';
import { Access, AccessTuple, ANONYMOUS, Deck, EDITOR, Identity, IdentityRole, Role, RoleName, VIEWER } from "../model/types";
import { toUsername } from './lerniCommon';
import LerniTheme from './lerniTheme';
import { invalidDeckName } from "./ZDeckEditorHeader";


const SectionHeadingStyle = {
    marginTop: "1rem",
    marginBottom: "0.5rem"
}

enum SharingDialogStage {
    Begin,
    NameForm,
    ShareForm,
    Collaborators
}


interface SharingDialogNameProps {
    oldName: string;
    onNextState: () => void;
}

interface ShareCollaboratorProps {
    identity: Identity;
    removeCollaborator: (uid: string) => void;
}
function ZShareCollaborator(props: ShareCollaboratorProps) {
    const {identity, removeCollaborator} = props;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                borderStyle: "solid",
                borderColor: "rgb(235,235,235)",
                borderWidth: "1px",
                borderRadius: "10px",
                paddingLeft: "8px",
                "&:hover": {
                    backgroundColor: "rgb(235,235,235)"
                }
            }}
        >
            <Tooltip title={"@" + identity.username}>
                <Box
                    component="span"
                    sx={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis"
                    }}
                
                >{identity.displayName}</Box>
            </Tooltip>
            <IconButton 
                size="small"
                onClick={() => removeCollaborator(identity.uid)}
            >
                <CloseIcon fontSize='small'/>
            </IconButton>
        </Box>
    )
}



function distinctCollaborators(array: Identity[]) {
    const set = new Set<string>();
    const result: Identity[] = [];
    array.forEach(identity => {
        if (!set.has(identity.uid)) {
            set.add(identity.uid);
            result.push(identity);
        }
    })

    return result;
}
interface CollaboratorsFieldProps {
    newCollaborators: Identity[];
    setNewCollaborators: (value: Identity[]) => void
}
function ZCollaboratorsField(props: CollaboratorsFieldProps) {
    const {newCollaborators, setNewCollaborators} = props;
    const [username, setUsername] = useState<string>('');
    const [identity, setIdentity] = useState<null | Identity>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    function removeCollaborator(uid: string) {
        const newCollab = newCollaborators.filter(identity => identity.uid !== uid);
        setNewCollaborators(newCollab);
    }

    function handleIdentityMenuClose() {
        setIdentity(null);
    }

    function handleIdentityClick() {
        if (identity) {
            setNewCollaborators(distinctCollaborators([
                ...newCollaborators,
                identity
            ]));
            
        }
        setUsername("");
        handleIdentityMenuClose();
    }

    function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAnchorEl(event.currentTarget);
        const v = event.currentTarget.value;
        if (v === '') {
            setUsername(v);
        } else {
            const value = '@' + toUsername(v);
            setUsername(value);
            getIdentityByUsername(value).then(
                identity => {
                    if (identity) {
                        setIdentity(identity);
                    }
                }
            ).catch(
                error => console.error(error)
            )
        }
    }
    
    const identityMenuOpen = Boolean(identity);

    return (
        <Box
            component="form"
            sx={{ 
                paddingLeft: "8px",
                display: 'flex', 
                alignItems: 'center', 
                flexGrow: 1,
                borderColor: LerniTheme.dividerColor,
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "4px"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: "8px"
                }}
            >
                {newCollaborators.map(identity => (
                    <ZShareCollaborator
                        key={identity.uid}
                        identity={identity}
                        removeCollaborator={removeCollaborator}
                    />
                ))}
            </Box>
            <InputBase
                value={username}
                onChange={handleUsernameChange}
                sx={{
                    flexGrow: 1,
                    marginLeft: 1
                }}
                inputProps={{
                    "aria-label" : "add collaborator"
                }}
            />
            <Menu
                open={identityMenuOpen}
                onClose={handleIdentityMenuClose}
                anchorEl={anchorEl}
            >
                <MenuItem onClick={handleIdentityClick}>
                    <Box display="flex">
                        <PersonIcon color="primary" sx={{marginRight: "0.5rem"}}/>
                        <Typography>{identity?.displayName}</Typography>                        
                    </Box>
                </MenuItem>
            </Menu>
        </Box>

    )

}

export function ZSharingDialogName(props: SharingDialogNameProps) {
    const {oldName, onNextState} = props;
    
    const api = useEntityApi();
    const {deckId} = useParams();
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
            if (deckId) {
                updateDeckName(api, deckId, newName);
            }
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

interface ShareTitleProps {
    resourceName: string;
}
function ZShareTitle(props: ShareTitleProps) {
    const {resourceName} = props;
    return (
        <Box sx={{display: "flex", flexWrap: "nowrap", width: "100%"}}>
            <span>Share&nbsp;</span> 
            <span style={{flexGrow: 1, textOverflow: "ellipsis"}}>"{resourceName}"</span>
        </Box>
    )
}

interface CollaboratorsWithRoleProps {
    newCollaborators: Identity[];
    setNewCollaborators: (value: Identity[]) => void;
    role: Role;
    setRole: (value: Role) => void;
}
function ZCollaboratorsWithRole(props: CollaboratorsWithRoleProps) {
    const {newCollaborators, setNewCollaborators, role, setRole} = props;

    function handleRoleChange(event: SelectChangeEvent) {
        setRole(event.target.value as Role)
    }

    return (
        <Box
            sx={{
                display: "flex",
                gap: "1rem",
                width: "30rem"
            }}
        >
            <ZCollaboratorsField 
                newCollaborators={newCollaborators}
                setNewCollaborators={setNewCollaborators}
            />
            <Select
                value={role}
                onChange={handleRoleChange}
            >
                <MenuItem value={EDITOR}>{RoleName[EDITOR]}</MenuItem>
                <MenuItem value={VIEWER}>{RoleName[VIEWER]}</MenuItem>
            </Select>
        </Box>
    )
}

interface AddCollaboratorsProps {
    newCollaborators: Identity[];
    setNewCollaborators: (value: Identity[]) => void;
    setStage: (value: SharingDialogStage) => void;
    resourceId: string;
    resourceName: string;
    onClose: () => void;

}



function ZAddCollaborators(props: AddCollaboratorsProps) {
    const {resourceId, resourceName, newCollaborators, setNewCollaborators, setStage, onClose} = props;
    
    const [role, setRole] = useState<Role>(EDITOR);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    function handleSubmit() {
        setSubmitDisabled(true);
        const data = newCollaborators.map(identity => createIdentityRole(identity, role));
        injectCollaborators(resourceId, data).then(
            (failures) => {

                if (failures.length > 0) {

                    let message = "Failed to share with ";
                    failures.forEach( (identity, index) => {
                        if (index > 0 && index < failures.length-1) {
                            message += ', ';
                        } if (index > 0 && index === failures.length-1) {
                            message += " and ";
                        }
                        message += '@' + identity.username;
                    })

                    console.log(message);
                    setErrorMessage(message);
                    setSubmitDisabled(false);
                } else {
                    setNewCollaborators([]);
                    setStage(SharingDialogStage.ShareForm);
                }
            }
        ).catch(
            error => {
                console.error("ZAddCollaborators failed to inject collaborators", error);
                setErrorMessage(
                    "An error occurred while saving the collaborators"
                )
                setSubmitDisabled(false);
            }
        )
    }

    return (
        <>
        <DialogTitle sx={{paddingLeft: "0px"}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
                <IconButton
                    onClick={()=>setStage(SharingDialogStage.ShareForm)}
                >
                    <ArrowBackIcon/>
                </IconButton>
                <ZShareTitle resourceName={resourceName}/>
            </Box>
            
        </DialogTitle>
        <DialogContent>
            {errorMessage && (
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            )}
            <ZCollaboratorsWithRole
                role={role}
                setRole={setRole}
                newCollaborators={newCollaborators}
                setNewCollaborators={setNewCollaborators}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={submitDisabled}
            >
                Submit
            </Button>
        </DialogActions>
        </>
    )
}

interface EmphasisProps {
    children: React.ReactNode;
}
function ZEmphasis(props: EmphasisProps) {
    const {children} = props;
    return (
        <Box component="b" sx={{color: "rgba(0, 0, 0, 0.6)"}}>
            {children}
        </Box>
    )
}

interface FullIdentityProps {
    identity: Identity;
}
function ZFullIdentity(props: FullIdentityProps) {
    const {identity} = props;

    return (
        <Box
            sx={{
                display: "flex"
            }}
        >
            <PersonIcon color="primary"/>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "8px"
                }}
            >
                <ZEmphasis>{identity.displayName}</ZEmphasis>
                <Box component="span" sx={{fontSize: "80%"}}>
                    {"@" + identity.username}
                </Box>
            </Box>
        </Box>
    )
}

const REMOVE_ACCESS = "removeAccess";

interface IdentityRoleProps {
    resourceId: string;
    identityRole: IdentityRole;
}
function ZIdentityRole(props: IdentityRoleProps) {
    const {resourceId, identityRole} = props;
    const [role, setRole] = useState<Role>(identityRole.role);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const identity = identityRole.identity;

    async function handleRoleChange(event: SelectChangeEvent) {
        const value = event.target.value;
        if (value===EDITOR || value===VIEWER) {
            try {
                await changeCollaboratorRole(resourceId, identityRole);
                setRole(value);
            } catch (error) {
                console.log("changeCollaboratorRole faile", error);
                const message = "Failed to change the role of @" + identityRole.identity.username;
                setErrorMessage(message);
                setTimeout(() => {
                    setErrorMessage("");
                }, 2000)
            }
        } else if (value===REMOVE_ACCESS) {
             try {
                await removeAcess(resourceId, identityRole);
             } catch (error) {
                console.log(error);
                const message = 'Failed to remove access for @' + identityRole.identity.username;
                setErrorMessage(message);
                setTimeout(() => {
                    setErrorMessage("");
                }, 2000)
                
             }
        }
        // TODO: dispatch the change to Firestore
    }

    return (
        <Box
            id={"identityRole-" + identity.username}
            sx={{
                display: "flex",
                width: "100%",
                padding: "5px",
                borderTopLeftRadius: "30px",
                borderBottomLeftRadius: "30px",
                "&:hover" : {
                    backgroundColor: LerniTheme.hoverBackgroundColor
                },
                "& div:first-of-type" : {
                    flexGrow: 1
                }
            }}
        >
            <ZFullIdentity identity={identity}/>
            <Select 
                size="small"
                value={role}
                onChange={handleRoleChange}
                sx={{alignLeft: "auto"}}
            >
                <MenuItem value={VIEWER}>{RoleName[VIEWER]}</MenuItem>
                <MenuItem value={EDITOR}>{RoleName[EDITOR]}</MenuItem>
                <Divider/>
                <MenuItem value={REMOVE_ACCESS}>Remove Access</MenuItem>
            </Select>
            {errorMessage && (
                <Box>
                    <Alert severity='error'>
                        {errorMessage}
                    </Alert>
                </Box>
            )}
        </Box>
    )
}

function listCollaborators(access: Access) {
    const list = Object.values(access.collaborators);
    list.sort( (a, b) => {
        const aName = a.identity.displayName;
        const bName = b.identity.displayName;
        return aName.localeCompare(bName);
    })

    return list;
}

function nonNullIdentity(identity: undefined | Identity) {
    return identity || createIdentity(
        ANONYMOUS,
        ANONYMOUS,
        ANONYMOUS
    )
}

interface SharingDialogMainProps {
    deck: Deck;
    access: Access;
    owner: undefined | Identity;
    onClose: () => void;
    setDialogStage: (value: SharingDialogStage) => void
    setNewCollaborators: (value: Identity[]) => void
}
export function ZSharingDialogMain(props: SharingDialogMainProps) {
    const {deck, access, owner, onClose, setDialogStage, setNewCollaborators} = props;

    const resourceId = deck.id;
    const ownerIdentity = nonNullIdentity(owner);
    const general = access.general;

    const api = useEntityApi();
    const [message, setMessage] = useState<string>('');
    const [messageVisible, setMessageVisible] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [identity, setIdentity] = useState<null | Identity>(null);
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
            updateGeneralRole(api, resourceId);
        } else {
            updateGeneralRole(api, resourceId, VIEWER);
        }
        
    }

    function handleGeneralRoleChange(event: SelectChangeEvent) {
        const role = event.target.value as Role;
        updateGeneralRole(api, resourceId, role);
    }

    function handleDoneClick() {
        onClose();
    }
    
    function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAnchorEl(event.currentTarget);
        const v = event.currentTarget.value;
        if (v === '') {
            setUsername(v);
        } else {
            const value = '@' + toUsername(v);
            setUsername(value);
            getIdentityByUsername(value).then(
                identity => {
                    if (identity) {
                        setIdentity(identity);
                    }
                }
            ).catch(
                error => console.error(error)
            )
        }
    }

    function handleIdentityMenuClose() {
        setIdentity(null);
    }

    function handleIdentityClick() {
        if (identity) {
            setNewCollaborators([identity]);
            setDialogStage(SharingDialogStage.Collaborators);
        }
        handleIdentityMenuClose();
    }

    const identityMenuOpen = Boolean(identity);

    const generalAccessIcon = (
        (general===undefined && <LockIcon/>) ||
        <PublicIcon/>
    )

    if (!deck) {
        return null;
    }

    const collaborators = listCollaborators(access);

    const messageDisplay = message ? "flex" : "none";
        
    return (
        <>
            <DialogTitle>
                <ZShareTitle resourceName={deck.name}/>
            </DialogTitle>
            <DialogContent sx={{minWidth: "400px"}}>
                <TextField
                    size="small"
                    placeholder='Add People'
                    value={username}
                    onChange={handleUsernameChange}
                    autoComplete="off"
                    sx={{
                        marginBottom: "1rem",
                        width: "100%"
                    }}
                />
                <Menu
                    open={identityMenuOpen}
                    onClose={handleIdentityMenuClose}
                    anchorEl={anchorEl}
                >
                    <MenuItem onClick={handleIdentityClick}>
                        <Box display="flex">
                            <PersonIcon color="primary" sx={{marginRight: "0.5rem"}}/>
                            <Typography>{identity?.displayName}</Typography>
                        </Box>
                    </MenuItem>
                </Menu>
                <DialogContentText variant="subtitle1" sx={SectionHeadingStyle}>
                    People with access
                </DialogContentText>
                <Box sx={{
                    display: "flex",
                    padding: "5px",
                    borderTopLeftRadius: "30px",
                    borderBottomLeftRadius: "30px",
                    "&:hover" : {
                        backgroundColor: LerniTheme.hoverBackgroundColor
                    },
                    "& b:last-child": {
                        marginLeft: "auto"
                    }
                }}>
                    <ZFullIdentity identity={ownerIdentity}/>
                    <ZEmphasis>
                        Owner
                    </ZEmphasis>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        border: "1p solid red"
                    }}
                >
                    {collaborators.map(e => (
                        <ZIdentityRole
                            key={e.identity.uid}
                            resourceId={resourceId}
                            identityRole={e}
                        />
                    ))}
                </Box>
                <DialogContentText variant="subtitle1" sx={SectionHeadingStyle}>
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
 
interface SharingDialogProps {
    open: boolean;
    onClose: () => void;
    accessTuple: AccessTuple;
    deck: Deck | undefined
}

const SHARING_DIALOG = "SharingDialog";

export function ZSharingDialog(props: SharingDialogProps) {
    const {open, onClose, accessTuple, deck} = props;
    const api = useEntityApi();
    const [dialogStage, setDialogStage] = useState<SharingDialogStage>(SharingDialogStage.Begin);
    const [newCollaborators, setNewCollaborators] = useState<Identity[]>([]);
    const [, access, accessError] = accessTuple;
    const [, owner, ownerError] = useIdentity(SHARING_DIALOG, access?.owner);

    const user = useSessionUser();
    
    useEffect(() => {

        const ready = (
            dialogStage === SharingDialogStage.Begin &&
            deck &&
            user &&
            access
        );

        if (ready) {
            const nextState = invalidDeckName(deck.name) ? 
                SharingDialogStage.NameForm :
                SharingDialogStage.ShareForm;


            setDialogStage(nextState);
        }

        
    }, [dialogStage, deck, access, user])

    
    useEffect(
        () => () => disownAllLeases(api, SHARING_DIALOG), [api]
    )

    useEffect(() => {
        if (accessError || ownerError) {
            alertError(api, "An error occurred while accessing sharing options");
            if (accessError) {
                console.error("Failed to get access document", accessError)
            }
            if (ownerError) {
                console.error("Failed to get owner identity", ownerError);
            }
        }
    }, [api, accessError, ownerError])


    if (!deck || !access || !user || !owner) {
        return null;
    }

    function handleNextState() {
        setDialogStage(SharingDialogStage.ShareForm);
    }

    function dialogBody(deck: Deck, access: Access) {
        switch (dialogStage) {
            case SharingDialogStage.NameForm:
                return <ZSharingDialogName
                    oldName={deck.name}
                    onNextState={handleNextState}
                />

            case SharingDialogStage.ShareForm:
                return <ZSharingDialogMain
                    owner={owner}
                    deck={deck}
                    access={access}
                    onClose={onClose}
                    setDialogStage={setDialogStage}
                    setNewCollaborators={setNewCollaborators}
                />

            case SharingDialogStage.Collaborators:
                return <ZAddCollaborators 
                    newCollaborators={newCollaborators}
                    setNewCollaborators={setNewCollaborators}
                    setStage={setDialogStage}
                    resourceId={deck.id}
                    resourceName={deck.name}
                    onClose={onClose}
                />

            default: 
                return null;
        }
    }

    return (
        <Dialog 
            open={open}
            onClose={onClose}
        >
        
        { dialogBody(deck, access) }
        
        </Dialog>

    )
}