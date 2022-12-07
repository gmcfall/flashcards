import { Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { deckSubscribe, deckUnsubscribe, selectDeck } from "../model/deck";
import ZDeckEditorHeader from "./ZDeckEditorHeader";
import { useEffect } from "react"
import { useParams } from "react-router-dom";
import ZAccessDeniedAlert from "./ZAccessDeniedAlert";
import { ZAccessDeniedMessage } from "./ZAccessDeniedMessage";

export function ZDeckEditorContent() {
    
    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signInState = useAppSelector(selectSigninState);

    const {deckId} = useParams();
    const userUid = session?.user.uid;

    const deck = useAppSelector(selectDeck);

    useEffect(() => {
        if (deckId && userUid) {
            deckSubscribe(dispatch, deckId);
        }

        return () => {
            deckUnsubscribe();
        }

    }, [dispatch, deckId, userUid])
    
    if (registrationState || signInState) {
        return null;
    }

    if (!session) {
       return (
        <Box sx={{marginTop: "2rem"}}>
            <ZAccessDeniedAlert>
                <ZAccessDeniedMessage title='You must be signed in to access this Deck'/>
            </ZAccessDeniedAlert>
        </Box>
       )

    }
    if (!deck) {
        return (
            <Box sx={{marginTop: "2em"}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box></Box>
    )
}

export default function ZDeckEditor() {
    
    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZDeckEditorHeader/>
            <Box id="contentRoot" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box id="contentContainer" sx={{maxWidth: "50rem", minWidth: "20rem"}}>
                    <ZDeckEditorContent/>
                </Box>
            </Box>
        </Box>
    )
}