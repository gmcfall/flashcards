import AddIcon from '@mui/icons-material/Add';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import {
    Box, Button, CircularProgress, List, ListItem, ListItemButton,
    ListItemText, Tooltip, Typography
} from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { librarySubscribe, libraryUnsubscribe, selectLibrary } from '../model/library';
import { deckEditRoute } from '../model/routes';
import { ClientLibrary, ERROR, ResourceRef } from '../model/types';
import alertPost from '../store/actions/alertPost';
import deckNew from '../store/actions/deckNew';
import { HEADER_STYLE } from './header';
import ZAccessDeniedAlert from './ZAccessDeniedAlert';
import { ZAccessDeniedMessage } from './ZAccessDeniedMessage';
import ZAlert from "./ZAlert";
import ZAuthTools from './ZAuthTools';


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
            <ZAuthTools/>
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

    if (registrationState || signInState) {
        return null;
    }

    if (!session) {
       return (
        <Box sx={{marginTop: "2rem"}}>
            <ZAccessDeniedAlert>
                <ZAccessDeniedMessage resourceName='Library'/>
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