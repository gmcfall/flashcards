import { Box, CircularProgress } from "@mui/material";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { deckSubscribe, deckUnsubscribe, selectDeck } from "../model/deck";
import { unsubscribeAllCards } from "../model/flashcard";
import { Deck } from "../model/types";
import LerniTheme from "./lerniTheme";
import ZAccessDeniedAlert from "./ZAccessDeniedAlert";
import { ZAccessDeniedMessage } from "./ZAccessDeniedMessage";
import ZDeckEditorHeader from "./ZDeckEditorHeader";
import ZFlashcard from "./ZFlashcard";


export interface TiptapProps {
    editor: Editor | null;
}

function ZDeckEditorContent(props: TiptapProps) {

    const {editor} = props;
    
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
        <Box id="content-root" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
            <Box className="tiptap-container" sx={{width: "100%", position: "relative", padding: "5em"}}>
                <EditorContent editor={editor}/>
            </Box>
        </Box>
    )
}


function ZCardList() {
    const deck = useAppSelector(selectDeck);
    
    if (!deck) {
        return null;
    }
    
    return (
        <Box id="card-list" sx={{
            width: "20em",
            height: "100%",
            borderRightStyle: "solid",
            borderRightWidth: "1px",
            borderRightColor: LerniTheme.dividerColor,
            padding: "1em"
        }}>
        {deck.cards.map(ref => {
            // TODO: lookup the CardInfo and pass as an argument.
            return (
                <ZFlashcard key={ref.id}/>
            )
        })}
        </Box>
    )
}



function ZDeckBody(props: TiptapProps) {
    const {editor} = props;

    return (
        <Box id="deck-body" sx={{display: "flex", height: "100%", width: "100%"}}>
            <ZCardList/>
            <ZDeckEditorContent editor={editor}/>
        </Box>
    )
}

export default function ZDeckEditor() {
    const editor = useEditor({
        editorProps: {
            attributes: {
                class: 'deck-editor-tiptap'
            }
        },
        extensions: [
        StarterKit,
        ],
        content: '<p>Hello World!</p>',
    })

    return (
        <Box id="deck-editor" sx={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            <ZDeckEditorHeader/>
            <ZDeckBody editor={editor}/>
        </Box>
    )
}