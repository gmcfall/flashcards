import { Box, Button, CircularProgress } from "@mui/material";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import { useCallback, useContext, useEffect, useState } from "react";
import { useDocListener, useEntityApi, useReleaseAllClaims } from "@gmcfall/react-firebase-state";
import { useAccessControl, useAccountIsIncomplete, useFlashcard, useSessionUser } from "../../../../hooks/customHooks";
import { checkPrivilege, resourceNotFound } from "../../../../model/access";
import { deckPath, DECK_LISTENER_OPTIONS } from "../../../../model/deck";
import { addFlashcard, deleteFlashcardByIndex, saveFlashcardContent, updateFlashcardContent } from "../../../../model/flashcard";
import { userToIdentity } from "../../../../model/identity";
import { deckEditRoute } from "../../../../model/routes";
import { ClientFlashcard, Deck, DeckQuery, EDIT } from "../../../../model/types";
import { DECK_EDITOR, TIP_TAP_EXTENSIONS } from "../../../../components/deckEditorConstants";
import { CARD_CONTAINER, DECK_EDITOR_TIPTAP, DECK_NAME_INPUT } from "../../../../components/lerniConstants";
import LerniTheme from "../../../../components/lerniTheme";
import ZAccountIncomplete from "../../../../components/ZAccountIncomplete";
import ZDeckEditorHeader from "../../../../components/ZDeckEditorHeader";
import ZFlashcard from "../../../../components/ZFlashcard";
import ZNeedAccess from "../../../../components/ZNeedAccess";
import ZNotFound from "../../../../components/ZNotFound";
import { RegistrationContext } from "../../../../components/ZRegistrationProvider";
import { SigninContext } from "../../../../components/ZSigninProvider";
import { useRouter } from "next/router";

const HEIGHT_WIDTH_RATIO = 0.6;
const MAX_FONT_SIZE = 200; // %
const MAX_WIDTH = 1500;
const MAX_HEIGHT = HEIGHT_WIDTH_RATIO*MAX_WIDTH;
const MARGIN = 40;

const NO_CARDS = -1;
const NOT_READY = -2;
const NO_REDIRECT = -3;
const REDIRECTING = -4;

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

interface FlashcardEditorProps {
    setEditor: (editor: Editor) => void;
    card: ClientFlashcard;
}

function ZFlashcardEditor(props: FlashcardEditorProps) {
    const {setEditor, card} = props;

    const api = useEntityApi();

    const editor = useEditor({
        content: card.content,     
        editorProps: {
            attributes: {
                class: DECK_EDITOR_TIPTAP
            }
        },
        onUpdate({editor}) {
            const json = editor.getJSON();
            updateFlashcardContent(api, card.id, json);
            updateCardFontSize();
        },
        extensions: TIP_TAP_EXTENSIONS
    })

    // The first effect sets the editor so that it is available to the header
    // and produces a timer for saving the content every 5 seconds
    const cardId = card.id;
    useEffect(() => {
        let token: ReturnType<typeof setInterval> | null = null;
        if (editor) {
            setEditor(editor);
            token = setInterval(() => {
                saveFlashcardContent(api, cardId);
            }, 5000)
        }

        return () => {
            if (token && cardId) {
                saveFlashcardContent(api, cardId);
                clearInterval(token);
            }
        }
    }, [api, editor, setEditor, cardId])

    // The next effect resizes the editor content once the actual
    // (not virtual) DOM node exists. To that end, we utilize a combination
    // of `useState` and `useCallback`. This way `setCardContainerEl` 
    // will trigger a rerender.
    const [cardContainerEl, setCardContainerEl] = useState<HTMLElement | null>(null);
    const cardContainerRef = useCallback((node: HTMLElement) => {
        setCardContainerEl(node);
    }, [])

    useEffect(() => {
        
        if (cardContainerEl) {
            resizeEditorContent();
            window.addEventListener("resize", resizeEditorContent);
        }
        return () => {
            if (cardContainerEl) {
                window.removeEventListener("resize", resizeEditorContent);
            }
        }
    }, [cardContainerEl]);
    
    return (
        <Box 
            id={CARD_CONTAINER}
            className={CARD_CONTAINER}
            ref={cardContainerRef}
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

interface DeckEditorContentProps {
    setEditor: (editor: Editor) => void;
    deck: Deck | undefined;
    cardId: string | undefined;
}

function ZDeckEditorContent(props: DeckEditorContentProps) {

    const {deck, cardId, setEditor} = props;
    const router = useRouter();
    const api = useEntityApi();
    const user = useSessionUser();
    const [registerActive] = useContext(RegistrationContext);
    const [signinActive] = useContext(SigninContext);
    const [card] = useFlashcard(cardId);

    if (registerActive || signinActive || !user) {
        return null;
    }
    if (!deck) {
        return (
            <Box sx={{marginTop: "2em"}}>
                <CircularProgress/>
            </Box>
        );
    }

    function handleClick() {
        if (deck) {
            addFlashcard(api, router, deck.id);
        }
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

    if (!card) {
        return null;
    }

    return (
        <ZFlashcardEditor
            key={card.id}
            card={card}
            setEditor={setEditor}
        />
    )
}

interface CardListProps {
    deck: Deck | undefined;
    activeCardId: string | undefined;
}
function ZCardList(props: CardListProps) {
    const {deck, activeCardId} = props;
    
    if (!deck) {
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
        {deck.cards.map((ref, index) => {
          
            return (
                <ZFlashcard 
                    key={ref.id}
                    deckId={deck.id}
                    activeCardId={activeCardId}
                    cardIndex={index}
                    cardId={ref.id}
                />
            )
        })}
        </Box>
    )
}


interface DeckEditorBodyProps {
    setEditor: (editor: Editor) => void;
    deck: Deck | undefined;
    cardId: string | undefined;
}

function ZDeckBody(props: DeckEditorBodyProps) {
    const {setEditor, deck, cardId} = props;

    return (
        <Box id="deck-body" sx={{display: "flex", height: "100%", width: "100%"}}>
            <ZCardList 
                deck={deck}
                activeCardId={cardId}
            />
            <ZDeckEditorContent
                setEditor={setEditor}
                deck={deck}
                cardId={cardId}
            />
        </Box>
    )
}

function parseCardIndex(deck: Deck | undefined | null, cardIndexParam: string | undefined) {
    if (!deck) {
        return [NOT_READY, NO_REDIRECT];
    }

    const cardCount = deck.cards.length;
    const cardIndex = cardIndexParam===undefined ? NaN : parseInt(cardIndexParam);
    if (Number.isNaN(cardIndex)) {
        return (
            cardCount === 0 ? 
                [NO_CARDS, NO_REDIRECT] : 
                [REDIRECTING, 0]
        )

    } else if (cardCount === 0) {
        return [REDIRECTING, NO_CARDS];
    } else if (cardIndex < 0) {
        return [REDIRECTING, 0];
    } else if (cardIndex >= cardCount) {
        return [REDIRECTING, cardCount-1];
    } else {
        return [cardIndex, NO_REDIRECT];
    }
    
}

export default function ZDeckEditor() {
    const router = useRouter();
    const api = useEntityApi();
    const {deckId, cardIndexSlug} = router.query as DeckQuery;
    const cardIndex = cardIndexSlug?.[0];
    const accountIsIncomplete = useAccountIsIncomplete();
    const user = useSessionUser();
    const [deck, deckError] = useDocListener(DECK_EDITOR, deckPath(deckId), DECK_LISTENER_OPTIONS);
    const accessTuple = useAccessControl(DECK_EDITOR, deckId);
    const [editor, setEditor] = useState<Editor | null>(null);

    const [cardIndexNum, cardRedirect] = parseCardIndex(deck, cardIndex);
    const cardId = (cardIndexNum>=0 && deck) ? deck.cards[cardIndexNum].id : undefined;

    const userUid = user?.uid;
    
    const canEdit = deckError ? false : checkPrivilege(EDIT, accessTuple, deckId, userUid);

    useReleaseAllClaims(DECK_EDITOR);
    
    useEffect(() => {
        if (deckId) {
            if (cardRedirect === NO_CARDS) {
                router.push(deckEditRoute(deckId))
            } else if (cardRedirect>=0) {
                router.push(deckEditRoute(deckId, cardRedirect))
            }
        }

    }, [router, deckId, cardRedirect])

    useEffect(() => {
        const handleKeyup = (!deckId || cardIndexNum<0) ? undefined : (
            (event: KeyboardEvent) => {
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
                        if (deckId && cardIndexNum >= 0) {
                            deleteFlashcardByIndex(api, deckId, cardIndexNum);
                        }
                        break;
                }
            }
        )

        if (handleKeyup) {
            document.addEventListener('keyup', handleKeyup);
        }

        return () => {
            if (handleKeyup) {
                document.removeEventListener('keyup', handleKeyup);
            }
        }

    }, [api, deckId, cardIndexNum]);
  

    
    if (resourceNotFound(accessTuple)) {
        return (
            <ZNotFound message="The deck you are trying to access was not found."/>
        )
    }

    const [access] = accessTuple;

    if (!deckId || !access|| !user || cardIndexNum===REDIRECTING || !deck) {
        return null;
    }


    
    if (accountIsIncomplete) {
        return <ZAccountIncomplete/>
    }

    return (
        (!user && <Box/>) ||
        ((!canEdit) && (
            <ZNeedAccess 
                resourceId={deckId} 
                access={access} 
                requester={userToIdentity(user)}/>
        )) || (
            <Box id="deck-editor" sx={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
                <ZDeckEditorHeader editor={editor} deck={deck} accessTuple={accessTuple}/>
                <ZDeckBody
                    setEditor={setEditor}
                    deck={deck}
                    cardId={cardId}
                />
            </Box>
        )

    )
}