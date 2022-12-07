import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Box, CircularProgress, Typography, List, ListItem, ListItemButton, 
    ListItemText, Button, Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { librarySubscribe, libraryUnsubscribe, selectLibrary } from '../model/library';
import ZAlert from "./ZAlert";
import ZAuthToolsWithSessionCheck from "./ZAuthToolsWithSessionCheck";
import { useEffect } from "react";
import { ClientLibrary, ERROR, ResourceRef } from '../model/types';
import deckNew from '../store/actions/deckNew';
import alertPost from '../store/actions/alertPost';
import { useNavigate } from 'react-router-dom';
import { deckEditRoute } from '../model/routes';
import { HEADER_STYLE } from './header';


function ZFlashcardLibraryHeader() {

    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);

    function handleNewDeckButtonClick() {
        if (session) {
            dispatch(deckNew());
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
            <ZAuthToolsWithSessionCheck/>
        </Box>
    )
}

interface LibResourceProps {
    resource: ResourceRef
}

function ZLibResource(props: LibResourceProps) {
    const {resource} = props;
    const navigate = useNavigate();

    function handleClick() {
        navigate(deckEditRoute(resource.id));
    }

    return (
        <ListItemButton onClick={handleClick}>
            <ListItemText primary={resource.name}/>
        </ListItemButton>
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
                    <ListItem key={resource.id}>
                        <ZLibResource resource={resource}/>
                    </ListItem>
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

    if (!session && !registrationState && !signInState && !lib) {
       return <CircularProgress/>
    }

    if (!lib) {
        return null;
    }

    return <ZLibraryResourceList lib={lib}/>;
}


export default function ZFlashcardLibrary() {

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZFlashcardLibraryHeader/>
            <Box id="contentRoot" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box id="contentContainer" sx={{maxWidth: "50rem", minWidth: "20rem"}}>
                    <ZLibraryContent/>
                </Box>
            </Box>
        </Box>
    )
}