import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Box, CircularProgress, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { librarySubscribe, libraryUnsubscribe, selectLibrary } from '../model/library';
import ZAlert from "./ZAlert";
import ZAuthToolsWithSessionCheck from "./ZAuthToolsWithSessionCheck";
import { useEffect } from "react";
import { ClientLibrary } from '../model/types';


function ZFlashcardLibraryHeader() {

    return (
        <Box sx={{
            display: 'flex', 
            minHeight: "3em", 
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "grey.400",
            alignItems: 'center',
            paddingLeft: "2em"
        }}>
            <LocalLibraryIcon/>
            <Typography variant="h1" sx={{marginLeft: "1rem"}}>Library</Typography>
            <ZAlert/>
            <ZAuthToolsWithSessionCheck/>
        </Box>
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
                        <ListItemButton >
                            <ListItemText primary={resource.name}/>
                        </ListItemButton>
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
            <Box sx={{display: "flex", flexDirection: "column", alignContent: "center"}}>
                <ZLibraryContent/>
            </Box>
        </Box>
    )
}