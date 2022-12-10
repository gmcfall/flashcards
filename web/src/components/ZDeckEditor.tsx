import { Box, CircularProgress } from "@mui/material";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { deckSubscribe, deckUnsubscribe, selectDeck } from "../model/deck";
import { selectCards, unsubscribeAllCards } from "../model/flashcard";
import { selectNewActiveCard } from "../model/deckEditor";
import deckeditorNewActiveCardDelete from "../store/actions/deckeditorNewActiveCardDelete";
import deckeditorUnmount from "../store/actions/deckeditorUnmount";
import flashcardContentSave from "../store/actions/flashcardContentSave";
import flashcardContentUpdate from "../store/actions/flashcardContentUpdate";
import LerniTheme from "./lerniTheme";
import ZAccessDeniedAlert from "./ZAccessDeniedAlert";
import { ZAccessDeniedMessage } from "./ZAccessDeniedMessage";
import ZDeckEditorHeader from "./ZDeckEditorHeader";
import ZFlashcard from "./ZFlashcard";
import deckeditorMount from "../store/actions/deckeditorMount";
import flashcardDelete from "../store/actions/flashcardDelete";
import { DECK_EDITOR_TIPTAP, DECK_NAME_INPUT } from "./lerniConstants";


export interface TiptapProps {
    editor: Editor | null;
}

function ZDeckEditorContent(props: TiptapProps) {

    const {editor} = props;
    
    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signInState = useAppSelector(selectSigninState);


    const deck = useAppSelector(selectDeck);

    
    if (registrationState || signInState || !editor) {
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
        <Box className="tiptap-container" sx={{
            display: "flex", 
            justifyContent: "center",
            width: "100%",
            padding: "2rem"
        }}>
            <EditorContent editor={editor}/>
        </Box>
    )
}

function ZCardList(props: TiptapProps) {
    const {editor} = props;
    const deck = useAppSelector(selectDeck);
    const cards = useSelector(selectCards);
    
    if (!deck || !editor) {
        return null;
    }
    
    return (
        <Box className="card-list" sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "175px",
            height: "100%",
            borderRightStyle: "solid",
            borderRightWidth: "1px",
            borderRightColor: LerniTheme.dividerColor,
            paddingLeft: "20px",
            paddingRight: "20px",
        }}>
        {deck.cards.map(ref => {
            const cardInfo = cards[ref.id];
            if (!cardInfo) {
                return null;
            }
            return (
                <ZFlashcard 
                    key={ref.id}
                    editor={editor}
                    cardInfo={cardInfo}
                />
            )
        })}
        </Box>
    )
}



function ZDeckBody(props: TiptapProps) {
    const {editor} = props;

    return (
        <Box id="deck-body" sx={{display: "flex", height: "100%", width: "100%"}}>
            <ZCardList editor={editor}/>
            <ZDeckEditorContent editor={editor}/>
        </Box>
    )
}

export default function ZDeckEditor() {
    const dispatch = useAppDispatch();
    const newActiveCard = useSelector(selectNewActiveCard);
    
    const {deckId} = useParams();
    const session = useAppSelector(selectSession);
    const userUid = session?.user.uid;
    
    const editor = useEditor({        
        editorProps: {
            attributes: {
                class: DECK_EDITOR_TIPTAP
            }
        },
        extensions: [
            StarterKit,
        ],
        content: '',
    })

    useEffect(() => {
        function handleKeyup(event: KeyboardEvent) {
            const target = event.target as any;
            const classList = target.classList;
            if (
                classList.contains(DECK_EDITOR_TIPTAP) ||
                classList.contains(DECK_NAME_INPUT)
            ) {
                return;
            }
            switch (event.key) {
                case 'Delete': 
                    dispatch(flashcardDelete())
                    break;
            }
        }
        if (deckId) {
            document.addEventListener('keyup', handleKeyup);
            dispatch(deckeditorMount(deckId))
        }

        return () => {
            if (deckId) {
                document.removeEventListener('keyup', handleKeyup);
                dispatch(deckeditorUnmount())
            }
        }

    }, [dispatch, deckId]);

    
    useEffect(() => {
        const ok = deckId && userUid;
        if (ok) {
            deckSubscribe(dispatch, deckId);
        }

        return () => {
            if (ok) {
                unsubscribeAllCards();
                deckUnsubscribe();
            }
        }

    }, [dispatch, deckId, userUid])

    useEffect(() => {
        const token = setInterval(() => {
            dispatch(flashcardContentSave(null));
        }, 5000)

        return () => {
            dispatch(flashcardContentSave(null));
            clearInterval(token);
        }
    }, [dispatch]);

    useEffect(() => {
        if (editor) {
            editor.on('update', () => {
                const content = editor.getHTML();
                dispatch(flashcardContentUpdate(content));
            })
        }
    }, [editor, dispatch])

    useEffect(() => {
        if (newActiveCard && editor) {
            editor.commands.setContent(newActiveCard.content);
            dispatch(deckeditorNewActiveCardDelete());
        }
    }, [newActiveCard, editor, dispatch])
    

    return (
        <Box id="deck-editor" sx={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            <ZDeckEditorHeader editor={editor}/>
            <ZDeckBody editor={editor}/>
        </Box>
    )
}