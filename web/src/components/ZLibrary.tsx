import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Alert, Box, Button, CircularProgress, IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip, Typography } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectAccountIsIncomplete, selectCurrentUser, selectRegistrationState, selectSession, selectSigninActive } from "../model/auth";
import { libraryUnsubscribe, selectLibrary, subscribeLibrary } from '../model/library';
import { deckEditRoute } from '../model/routes';
import { ClientLibrary, ERROR, Metadata, ResourceRef, UNKNOWN_RESOURCE_TYPE } from '../model/types';
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
    const session = useAppSelector(selectSession);
    const navigate = useNavigate();

    function handleNewDeckButtonClick() {
        if (session) {
            dispatch(deckAdd(navigate));
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
    const user = useSelector(selectCurrentUser);

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

interface LibraryContentProps {
    lib: ClientLibrary
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
function ZLibraryResourceList(props: LibraryContentProps) {
    const {lib} = props;

    const metadata = lib.metadata;

    return (
        <List>
            {
                lib.resources.map(id => (
                    <ZLibResource key={id} resource={resourceRef(id, metadata)}/>
                ))
            }
        </List>
    )

}

function ZLibraryContent() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signinActive = useAppSelector(selectSigninActive);
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

    if (registrationState || signinActive || !session) {
        return null;
    }
    
    if (accountIsIncomplete) {
        return <ZAccountIncomplete/>
    }

    if (!user) {
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
        dispatch(deckAdd(navigate));
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

    return <ZLibraryResourceList lib={lib}/>;
}


export default function ZLibrary() {

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZLibraryHeader/>
            <Box id="contentRoot" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box id="contentContainer" sx={{maxWidth: "50rem", minWidth: "20rem"}}>
                    <ZLibraryContent/>
                </Box>
            </Box>
        </Box>
    )
}