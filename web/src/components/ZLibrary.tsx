import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import {
    Alert, Box, Button, CircularProgress, FormControl, IconButton, List, ListItem, ListItemButton,
    ListItemText, MenuItem, Paper, Select, SelectChangeEvent, Tooltip, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useData } from '../fbase/hooks';
import { useSessionUser } from '../hooks/customHooks';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { createIdentityRole, injectCollaborators, persistAccessResponse } from '../model/access';
import { selectAccountIsIncomplete, selectRegistrationState, selectSigninActive } from "../model/auth";
import { libraryUnsubscribe, removeNotification, selectLibrary, subscribeLibrary } from '../model/library';
import { deckEditRoute } from '../model/routes';
import {
    AccessNotification, AccessRequest, AccessResponse, ClientLibrary, EDITOR, ERROR,
    Metadata, ResourceRef, Role, RoleName, UNKNOWN_RESOURCE_TYPE, VIEWER
} from '../model/types';
import alertPost from '../store/actions/alertPost';
import deckAdd from '../store/actions/deckAdd';
import deckDelete from '../store/actions/deckDelete';
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from './header';
import ZAccessDeniedAlert from './ZAccessDeniedAlert';
import { ZAccessDeniedMessage } from './ZAccessDeniedMessage';
import ZAccountIncomplete from './ZAccountIncomplete';
import ZAlert from "./ZAlert";
import ZAuthTools from './ZAuthTools';


function ZLibraryHeader() {

    const dispatch = useAppDispatch();
    const user = useSessionUser();
    const navigate = useNavigate();

    function handleNewDeckButtonClick() {
        if (user) {
            dispatch(deckAdd({navigate, user}));
        } else {
            dispatch(alertPost({
                severity: ERROR,
                message: "You must be signed in to create a new Deck"
            }))
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
    resource: ResourceRef
}

function ZLibResource(props: LibResourceProps) {
    const {resource} = props;
    const dispatch = useAppDispatch();
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
        dispatch(deckDelete({deckId, userUid}))
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

function resourceRef(id: string, map: Record<string, Metadata>) : ResourceRef {
    const metadata = map[id];
    return (metadata) ? {
        id,
        type: metadata.type,
        name: metadata.name
    } : {
        id,
        type: UNKNOWN_RESOURCE_TYPE,
        name: "Loading..."
    }
}

interface LibraryContentProps {
    lib: ClientLibrary
}
function ZLibraryResourceList(props: LibraryContentProps) {
    const {lib} = props;

    const metadata = lib.metadata;

    return (
        <List sx={{maxWidth: "50rem", minWidth: "20rem"}}>
            {
                lib.resources.map(id => (
                    <ZLibResource key={id} resource={resourceRef(id, metadata)}/>
                ))
            }
        </List>
    )
}

interface AccessNotificationProps {
    userUid: string;
    notification: AccessNotification;
    metadata: Record<string, Metadata>;
}

function ZAccessNotification(props: AccessNotificationProps) {
    const {userUid, notification, metadata} = props;

    const meta = metadata[notification.resourceId];

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
    metadata?: Metadata;
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

    const dispatch = useAppDispatch();
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
                dispatch(alertPost({
                    severity: "success",
                    message: "Sharing was successful"
                }))
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
                            disabled={submitDisabled || !metadata}
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

function resourceName(metadata?: Metadata) {
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
                    metadata={lib.metadata}
                />
                
            
            </Paper>
        ))}
        </Box>

    )
}


function ZLibraryContent() {
    const dispatch = useAppDispatch();
    const user = useSessionUser();
    const registrationState = useAppSelector(selectRegistrationState);
    const signinActive = useData(selectSigninActive);
    const accountIsIncomplete = useAppSelector(selectAccountIsIncomplete);
    const navigate = useNavigate();

    const lib = useAppSelector(selectLibrary);

    const userUid = user?.uid;

    useEffect(() => {
        if (userUid && !accountIsIncomplete) {
            subscribeLibrary(dispatch, userUid);
        }

        return () => {
            libraryUnsubscribe();
        }

    }, [dispatch, userUid, accountIsIncomplete])

    if (registrationState || signinActive || user===undefined) {
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
        dispatch(deckAdd({navigate, user}));
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