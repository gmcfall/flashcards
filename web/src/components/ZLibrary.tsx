import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import {
    Box, Button, ListItemButton, CircularProgress, IconButton, List, ListItem, Tooltip, Typography,
    ListItemText, Alert, Divider
} from "@mui/material";
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { librarySubscribe, libraryUnsubscribe, selectLibrary } from '../model/library';
import { deckEditRoute } from '../model/routes';
import { ClientLibrary, ERROR, ResourceRef } from '../model/types';
import alertPost from '../store/actions/alertPost';
import deckDelete from '../store/actions/deckDelete';
import deckAdd from '../store/actions/deckAdd';
import { HEADER_STYLE } from './header';
import ZAccessDeniedAlert from './ZAccessDeniedAlert';
import { ZAccessDeniedMessage } from './ZAccessDeniedMessage';
import ZAlert from "./ZAlert";
import ZAuthTools from './ZAuthTools';


function ZLibraryHeader() {

    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    const navigate = useNavigate();

    function handleNewDeckButtonClick() {
        if (session) {
            dispatch(deckAdd(navigate));
            // TODO: dispatch navigation to the DeckEditor
        } else {
            dispatch(alertPost({
                severity: ERROR,
                message: "You must be signed in to create a new Deck"
            }))
        }
    }

    return (
        <Box sx={HEADER_STYLE}>
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
    const session = useSelector(selectSession);

    if (!session) {
        return null;
    }
    const deckId = resource.id;
    const userUid = session.user.uid;

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
function ZLibraryResourceList(props: LibraryContentProps) {
    const {lib} = props;

    return (
        <List>
            {
                lib.resources.map(resource => (
                    <ZLibResource key={resource.id} resource={resource}/>
                ))
            }
        </List>
    )

}

function ZLibraryContent() {
    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signInState = useAppSelector(selectSigninState);

    const lib = useAppSelector(selectLibrary);

    const userUid = session?.user.uid;

    useEffect(() => {
        if (userUid) {
            librarySubscribe(dispatch, userUid);
        }

        return () => {
            libraryUnsubscribe();
        }

    }, [dispatch, userUid])

    if (registrationState || signInState) {
        return null;
    }

    if (!session) {
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

    if (lib.resources.length===0) {
        return (
            <Alert severity="info" sx={{width: "30em", marginTop: "2em"}}>
                <Box sx={{display: "flex", flexDirection:"column"}}>
                    <Typography variant="subtitle1">Your Library is empty</Typography>
                    <Divider/>
                    <Box sx={{marginTop: "1em"}}>
                        Use the
                        <Typography sx={{display: "inline-block"}} variant='button'>&nbsp;New Deck&nbsp;</Typography>
                        button to create a new deck and add it to your library.
                    </Box>
                    
                </Box>
            </Alert>
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