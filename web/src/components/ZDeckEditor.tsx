import { Box, Button, CircularProgress } from "@mui/material";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
import { deckSubscribe, deckUnsubscribe, selectDeck } from "../model/deck";
import { selectNewActiveCard } from "../model/deckEditor";
import { selectActiveCard, selectCards, unsubscribeAllCards } from "../model/flashcard";
import deckeditorMount from "../store/actions/deckeditorMount";
import deckeditorNewActiveCardDelete from "../store/actions/deckeditorNewActiveCardDelete";
import deckeditorUnmount from "../store/actions/deckeditorUnmount";
import flashcardAdd from "../store/actions/flashcardAdd";
import flashcardContentSave from "../store/actions/flashcardContentSave";
import flashcardContentUpdate from "../store/actions/flashcardContentUpdate";
import flashcardDelete from "../store/actions/flashcardDelete";
import { TIP_TAP_EXTENSIONS } from "./deckEditorConstants";
import { CARD_CONTAINER, DECK_EDITOR_TIPTAP, DECK_NAME_INPUT } from "./lerniConstants";
import LerniTheme from "./lerniTheme";
import ZAccessDeniedAlert from "./ZAccessDeniedAlert";
import { ZAccessDeniedMessage } from "./ZAccessDeniedMessage";
import ZDeckEditorHeader from "./ZDeckEditorHeader";
import ZFlashcard from "./ZFlashcard";

const HEIGHT_WIDTH_RATIO = 0.6;
const MAX_FONT_SIZE = 200; // %
const MAX_WIDTH = 1500;
const MAX_HEIGHT = HEIGHT_WIDTH_RATIO*MAX_WIDTH;
const MARGIN = 40;

export interface TiptapProps {
    editor: Editor | null;
}

/**
 * Dynamically adjust the height, width and fontSize of the "card-container"
 * element so that it is appropriate for the current window size.
 * 
 * This method gets invoked when the TipTap editor is initially rendered
 * and again whenever the window size changes.
 * 
 * This invocation during the initial load is tricky because the TipTap
 * editable will be empty until the card renders. In this case, we set 
 * a timeout to `updateCardFontSize` after a slight delay.
 */
function resizeEditorContent() {
    const container = document.getElementById(CARD_CONTAINER);
    if (container) {
        const target = container.firstChild as HTMLElement | null;
        if (target) {

            const box = container.getBoundingClientRect();
            const bw = box.width - MARGIN;
            const bh = box.height - MARGIN;
            const cx = 0.5*box.width;
            const cy = 0.5*box.height;

            const wMax = Math.min(bw, MAX_WIDTH);
            const hMax = Math.min(bh, MAX_HEIGHT);

            const w1 = wMax;
            const h1 = w1 * HEIGHT_WIDTH_RATIO;
            const d1 = w1*w1 + h1*h1;

            const h2 = hMax;
            const w2 = h2/HEIGHT_WIDTH_RATIO;
            const d2 = w2*w2 + h2*h2;

            const [width, height] = d1<=d2 ? [w1, h1] : [w2, h2];
            const style = target.style;
            const fontSize = Math.round(MAX_FONT_SIZE*width/MAX_WIDTH) + "%";
            style.left = cx - 0.5*width + "px";
            style.top = cy - 0.5*height + "px";
            style.width = width + "px";
            style.height = height + "px";
            style.fontSize = fontSize;
            target.setAttribute("data-basefontsize", fontSize);
            
            const editable = target.firstChild as HTMLElement | null; 

            // Getting innerHTML might be an expensive operation. If we see performance
            // issues, we should consider implementing a function to determine if the
            // editor is empty. This will become a non-issue once we refactor to create
            // a new TipTap Editor for each Card.
            
            const text = editable?.innerHTML || null;
            if (text !== '<p><br class="ProseMirror-trailingBreak"></p>') {
                
                updateCardFontSize();
            } else {
                setTimeout(() => {
                    updateCardFontSize()
                }, 5);
            }
        }
    }
}

function updateCardFontSize() {
    const container = document.getElementById(CARD_CONTAINER);
    if (container) {
        const target = container.firstChild as HTMLElement | null;
        if (target) {
            const style = target.style;
            let fontSize = parseInt(style.fontSize);
            let clientHeight = target.clientHeight;
            let scrollHeight = target.scrollHeight;
            
            while (scrollHeight > clientHeight) {
                fontSize--;
                style.fontSize = fontSize + "%";
                clientHeight = target.clientHeight;
                scrollHeight = target.scrollHeight;
            }

            const baseFontSizePercent = target.dataset.basefontsize;
            if (baseFontSizePercent) {
                const baseFontSize = parseInt(baseFontSizePercent);
                while (fontSize < baseFontSize) {
                    fontSize++;
                    style.fontSize = fontSize + "%";
                    clientHeight = target.clientHeight;
                    scrollHeight = target.scrollHeight;
                    if (scrollHeight > clientHeight) {
                        fontSize--;
                        style.fontSize = fontSize + "%";
                        break;
                    }
                }
            }
            
            

           
            
        }
    }
}

function ZDeckEditorContent(props: TiptapProps) {

    const {editor} = props;
    
    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signInState = useAppSelector(selectSigninState);
    const deck = useAppSelector(selectDeck);
    const activeCard = useAppSelector(selectActiveCard);

    const userUid = session?.user.uid;

    useEffect(() => {
        const ok = Boolean(userUid && activeCard);
        if (ok) {
            resizeEditorContent();
            window.addEventListener("resize", resizeEditorContent);
        }
        return () => {
            if (ok) {
                window.removeEventListener("resize", resizeEditorContent);
            }
        }
    }, [userUid, activeCard]);

    
    if (registrationState || signInState || !editor) {
        return null;
    }

    if (!session) {
       return (
        <Box sx={{
            display: 'flex', 
            marginTop: "2rem", 
            justifyContent: "center", 
            alignItems: "center", 
            width: "100%",
            alignSelf: "flex-start"
        }}>
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

    function handleClick() {
        dispatch(flashcardAdd());
    }
    if (deck.cards.length===0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Button variant="text" onClick={handleClick}>
                    Click to add a new Card
                </Button>
            </Box>
        )
    }

    return (
        <Box 
            id={CARD_CONTAINER}
            className={CARD_CONTAINER} 
            sx={{
                display: "block", 
                position: "relative",
                width: "100%",
                background: LerniTheme.contrastBackground
            }}
        >
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
        extensions: TIP_TAP_EXTENSIONS,
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
                const json = editor.getJSON();
                dispatch(flashcardContentUpdate(json));
                updateCardFontSize();
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