import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import {
    Alert, Box, Button, CircularProgress, FormControl, IconButton, List, ListItem, ListItemButton,
    ListItemText, MenuItem, Paper, Select, SelectChangeEvent, Tooltip, Typography
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { disownAllLeases, useDocListener, useEntity, useEntityApi } from '@gmcfall/react-firebase-state';
import { useAccountIsIncomplete, useSessionUser } from '../hooks/customHooks';
import { createIdentityRole, injectCollaborators, persistAccessResponse } from '../model/access';
import { alertError, alertSuccess } from '../model/alert';
import { addDeck, deleteDeckWithErrorAlert } from '../model/deck';
import { libraryPath, libraryTransform, removeNotification } from '../model/library';
import { metadataPath } from '../model/metadata';
import { deckEditRoute } from '../model/routes';
import {
    AccessNotification, AccessRequest, AccessResponse, ClientLibrary, EDITOR, Metadata, PartialMetadata, Role, RoleName, VIEWER
} from '../model/types';
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from './header';
import ZAccessDeniedAlert from './ZAccessDeniedAlert';
import { ZAccessDeniedMessage } from './ZAccessDeniedMessage';
import ZAccountIncomplete from './ZAccountIncomplete';
import ZAlert from "./ZAlert";
import ZAuthTools from './ZAuthTools';
import { RegistrationContext } from './ZRegistrationProvider';
import { SigninContext } from './ZSigninProvider';

const LIBRARY = "library";

function ZLibraryHeader() {

    const api = useEntityApi();
    const user = useSessionUser();
    const navigate = useNavigate();

    function handleNewDeckButtonClick() {
        if (user) {
            addDeck(api, navigate, user);
        } else {
            alertError(api, "You must be signed in to create a new Deck");
        }
    }

    return (
        <Box sx={{
            ...HEADER_STYLE,
            height: OUTLINED_TEXT_FIELD_HEIGHT
        }}>
            <LocalLibraryIcon/>
            <Typography variant="h1" sx={{marginLeft: "1rem", marginRight: '1.5rem'}}>Library</Typography>
            <Tooltip title="Create a new deck of flashcards and add it to your library">
                <Button 
                    variant="outlined"
                    startIcon={<AddIcon/>}
                    onClick={handleNewDeckButtonClick}
                >
                    New Deck
                </Button>
            </Tooltip>
            <ZAlert/>
            <ZAuthTools/>
        </Box>
    )
}

interface LibResourceProps {
    resource: PartialMetadata
}

function ZLibResource(props: LibResourceProps) {
    const {resource} = props;
    const api = useEntityApi();
    const navigate = useNavigate();
    const user = useSessionUser();

    if (!user) {
        return null;
    }
    const deckId = resource.id;
    const userUid = user.uid;

    function handleNavigate() {
        navigate(deckEditRoute(resource.id));
    }

    function handleDelete() {
        deleteDeckWithErrorAlert(api, deckId, userUid);
    }

    return (
        

        <ListItem
            sx={{
                "&:hover :last-child": {
                    opacity: 1
                }
            }}
            secondaryAction={
                <IconButton onClick={handleDelete} sx={{opacity: 0}}>
                    <DeleteIcon/>
                </IconButton>
            }
        >
           <ListItemButton onClick={handleNavigate}>
                <ListItemText primary={resource.name}/>
           </ListItemButton>
        </ListItem>
    )
}

interface LibraryContentProps {
    lib: ClientLibrary
}
function ZLibraryResourceList(props: LibraryContentProps) {
    const {lib} = props;


    return (
        <List sx={{maxWidth: "50rem", minWidth: "20rem"}}>
            {
                lib.resources.map(metadata => (
                    <ZLibResource key={metadata.id} resource={metadata}/>
                ))
            }
        </List>
    )
}

interface AccessNotificationProps {
    userUid: string;
    notification: AccessNotification;
}

function ZAccessNotification(props: AccessNotificationProps) {
    const {userUid, notification} = props;

    const [, meta] = useEntity<Metadata>(metadataPath(notification.resourceId));


    if (notification.hasOwnProperty("requester")) {
        return (
            <ZAccessRequest
                notification={notification as AccessRequest}
                metadata={meta}
            />
        )
    }

    if (notification.hasOwnProperty("accepted")) {
        return <ZAccessResponse
            userUid={userUid}
            notification={notification as AccessResponse}
            metadata={meta}
        />
    }

    return null;
}


interface AccessResponseProps {
    userUid: string;
    notification: AccessResponse;
    metadata?: PartialMetadata;
}

function ZAccessResponse(props: AccessResponseProps) {
    const {userUid, notification, metadata} = props;
    
    const name = resourceName(metadata);

    const text = notification.accepted ?
        `You have been granted access to “${name}”` :
        `You have been denied access to “${name}”`;

    const severity = notification.accepted ? "success" : "error";

    async function handleClick() {
        
        try {
            await removeNotification(userUid, notification.id);
        } catch (error) {
            console.log('ZAccessResponse handleClick', error);
        }
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column"
        }}>
            <Alert severity={severity}>
                {text}
            </Alert>

            <Box sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.75rem"
            }}>
                <Button 
                    variant='contained'
                    onClick={handleClick}
                >
                    OK
                </Button>
            </Box>
        </Box>
    )
}


interface AccessRequestProps {
    notification: AccessRequest;
    metadata?: Metadata;
}

function ZAccessRequest(props: AccessRequestProps) {
    const {notification, metadata} = props;

    const api = useEntityApi();
    const [role, setRole] = useState<Role>(EDITOR);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const requester = notification.requester;

    const text = `${requester.displayName} (@${requester.username}) 
        is requesting access to "${resourceName(metadata)}"`

    const message = notification.message;

    function handleRoleChange(event: SelectChangeEvent) {
        setRole(event.target.value as Role)
    }

    async function handleSubmit() {
        if (metadata) {
            setSubmitDisabled(true);
            const idRole = createIdentityRole(notification.requester, role);
    
            try {
                await injectCollaborators(notification.resourceId, [idRole]);
                await removeNotification(metadata.owner, notification.id);
                await persistAccessResponse(
                    notification.requester.uid,
                    notification.resourceId,
                    true
                )
                alertSuccess(api, "Sharing was successful");
            } catch (error) {
                setErrorMessage("An error occurred while sharing access.");
                console.log(error);
            }
        }
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column"
        }}>
            <Typography>{text}</Typography>
            {message && (
                <Typography sx={{
                    marginTop: "0.75rem",
                    maxWidth: "30rem",
                    paddingLeft: "1rem",
                    fontSize: "90%"
                }}>
                    {message}
                </Typography>
            )}
            <Box sx={{
                display: "flex",
                flexDirection: "column"
                
            }}>

            {errorMessage && (
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            )}
            {!errorMessage && (
                <>
                    <FormControl size="small" sx={{marginTop: "1rem", marginBottom: "1rem"}}>
                        <Box>
                            <Select
                                value={role}
                                onChange={handleRoleChange}
                            >
                                <MenuItem value={EDITOR}>{RoleName[EDITOR]}</MenuItem>
                                <MenuItem value={VIEWER}>{RoleName[VIEWER]}</MenuItem>
                            </Select>
                        </Box>
                    </FormControl>
                    <Box>
                        <Button
                            disabled={submitDisabled || !metadata?.owner}
                            variant='contained'
                            onClick={handleSubmit}
                        >
                            Share
                        </Button>
                    </Box>
                </>

            )}
            </Box>
        </Box>
    )
   
}

function resourceName(metadata?: PartialMetadata) {
    return metadata ? metadata.name : "Loading...";
}

interface LibraryNotificationsProps {
    userUid: string;
    lib: ClientLibrary;
}

function ZLibraryNotifications(props: LibraryNotificationsProps) {
    const {lib, userUid} = props;
    const notifications = lib.notifications;
    if (!notifications || notifications.length===0) {
        return null;
    }


    return (
        <Box>
        {notifications.map(n => (
            <Paper 
                key={n.id}
                elevation={3} 
                sx={{
                    marginLeft: "auto",
                    marginRight: "1rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    padding: "1rem"
                }}
            >

                <ZAccessNotification
                    userUid={userUid}
                    notification={n}
                />
                
            
            </Paper>
        ))}
        </Box>

    )
}

function ZLibraryContent() {
    const api = useEntityApi();
    const user = useSessionUser();
    const [registrationActive] = useContext(RegistrationContext);
    const [signinActive] = useContext(SigninContext);
    const accountIsIncomplete = useAccountIsIncomplete();
    const navigate = useNavigate();

    const path = libraryPath(user);

    const options = {
        transform: libraryTransform
    }

    const [, lib, libError] = useDocListener(LIBRARY, path, options);

    if (libError) {
        alertError(api, "An error occurred while loading your library", libError);
        return null;
    }

    const userUid = user?.uid;

    if (registrationActive || signinActive || user===undefined) {
        return null;
    }
    
    if (accountIsIncomplete) {
        return <ZAccountIncomplete/>
    }

    if (!user || !userUid) {
       return (
        <Box sx={{marginTop: "2rem"}}>
            <ZAccessDeniedAlert>
                <ZAccessDeniedMessage title='You must be signed in to access your Library'/>
            </ZAccessDeniedAlert>
        </Box>
       )

    }

    if (!lib) {
        return (
            <Box sx={{display: "flex", height: "100%", width: "100%", alignContent: "center", justifyContent: "center"}}>
                <CircularProgress/>
            </Box>
        );
    }

    function handleNewDeck() {
        if (user) {
            addDeck(api, navigate, user);
        }
    }
    if (lib.resources.length===0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                }}
            >
                <Alert severity="info" sx={{width: "30em", marginTop: "2em"}}>
                    <Box sx={{display: "flex", flexDirection:"column"}}>
                        <Typography>Your Library is empty</Typography>
                    </Box>
                </Alert>
                <div>
                    <Button variant="text" onClick={handleNewDeck}>
                        Click to add a Deck
                    </Button>
                </div>
            </Box>
        )
    }

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center"
        }}>
            <ZLibraryResourceList lib={lib}/>
            <ZLibraryNotifications lib={lib} userUid={userUid}/>
        </Box>
    );
}


export default function ZLibrary() {

    const api = useEntityApi();

    useEffect(
        () => () => disownAllLeases(api, LIBRARY), [api]
    )

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZLibraryHeader/>
            <Box id="contentRoot" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box id="contentContainer" sx={{
                    width: "100%"
                }}>
                    <ZLibraryContent/>
                </Box>
            </Box>
        </Box>
    )
}