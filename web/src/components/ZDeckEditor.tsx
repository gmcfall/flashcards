import { Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { deckSubscribe, deckUnsubscribe, selectDeck } from "../model/deck";
import ZDeckEditorHeader from "./ZDeckEditorHeader";
import { useEffect } from "react"
import { useParams } from "react-router-dom";
import ZAccessDeniedAlert from "./ZAccessDeniedAlert";
import { ZAccessDeniedMessage } from "./ZAccessDeniedMessage";
import { Deck } from "../model/types";
import ZFlashcard from "./ZFlashcard";
import { unsubscribeAllCards } from "../model/flashcard";

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
            unsubscribeAllCards();
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
        <Box sx={{marginTop: "2em"}}>
            <ZCardList deck={deck}/>
        </Box>
    )
}

interface CardListProps {
    deck: Deck
}

export function ZCardList(props: CardListProps) {
    const {deck} = props;
    
    return (
        <>
        {deck.cards.map(ref => {
            // TODO: lookup the CardInfo and pass as an argument.
            return (
                <ZFlashcard key={ref.id}/>
            )
        })}
        </>
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