import { EntityApi, useEntity, useEntityApi } from "@gmcfall/react-firebase-state";
import { useTheme } from "@mui/material";
import { Editor, EditorOptions } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import { generateHTML } from "@tiptap/html";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from 'yjs';
import { cardPath, flashcardRoomName, updateFlashcardContent } from "../model/flashcard";
import { deckEditRoute } from "../model/routes";
import { ClientFlashcard, EditorProvider, TiptapMap } from "../model/types";
import { TIP_TAP_EXTENSIONS, updateCardFontSize } from "./deckEditorShared";
import { CARD_CONTAINER, DECK_EDITOR_TIPTAP } from "./lerniConstants";
import { useSessionUser } from "../hooks/customHooks";
import { startCardWriter } from "../model/CardWriter";



function createTipTapEditor(
    api: EntityApi,
    userUid: string, 
    writer: string, 
    card: ClientFlashcard, 
    provider: WebrtcProvider
) {
    const options: Partial<EditorOptions> = {
        editorProps: {
            attributes: {
                class: DECK_EDITOR_TIPTAP
            }
        },
        extensions: [
            ...TIP_TAP_EXTENSIONS,
            Collaboration.configure({document: provider.doc})
        ],
        onUpdate({editor}) {
            const json = editor.getJSON();
            updateFlashcardContent(api, card.id, json);
            // For now, update the font size of the active card whenever any
            // card changes (whether active or not). If this presents a performance
            // problem, we can refactor to update the font size only if
            // it is the active card that was updated.
            updateCardFontSize()
        }
    }

    if (writer===userUid) {
        options.content = card.content;
    }

    return new Editor(options);
}

function createEditorProvider(api: EntityApi, userUid: string, writer: string, card: ClientFlashcard) : EditorProvider {
    const ydoc = new Y.Doc();
    const roomName = flashcardRoomName(card.id);

    // By default, WebrtcProvider includes "wss://signaling.yjs.dev" as a signaling server
    // But we have observed lot's of WebSocket connection failures to that server, so we omit it.
    // const provider = new WebrtcProvider(roomName, ydoc, {
    //     signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com']
    // });
    const provider = new WebrtcProvider(roomName, ydoc);
    const editor = createTipTapEditor(api, userUid, writer, card, provider);
    startCardWriter(api, card);

    return {editor, provider};
}

interface FlashcardProps {
    writer: string;
    editorProviders: TiptapMap;
    setEditorProvider: (cardId: string, value: EditorProvider) => void;
    activeCardId: string | undefined;
    deckId: string;
    cardId: string;
    cardIndex: number;
}

export default function ZFlashcard(props: FlashcardProps) {
    const {activeCardId, deckId, cardId, cardIndex, writer, editorProviders, setEditorProvider} = props;
    const router = useRouter();
    const theme = useTheme();
    const api = useEntityApi();
    const buttonEl = useRef<HTMLButtonElement>(null);
    const path = cardPath(cardId);
    const [card, cardError] = useEntity<ClientFlashcard>(path);
    const user = useSessionUser();
    const isActive = activeCardId === cardId;
    const content = card && card.content;

    const userUid = user?.uid;

    useEffect(() => {
        if (card) {
            const editorProvider = editorProviders[card.id];
            if (userUid && !editorProvider) {
                const value = createEditorProvider(api, userUid, writer, card);
                setEditorProvider(card.id, value);
            }
        }
    }, [userUid, writer, card, editorProviders, setEditorProvider])

    useEffect(()=> {

        const current = buttonEl.current;

        if (current && content) {
            const htmlContent = generateHTML(content, TIP_TAP_EXTENSIONS);
            current.innerHTML = htmlContent;
        }
        if (current && cardError) {
            console.error(`An error occurred while loading Flashcard(id=${cardId})`);
            current.innerHTML = '<p style="color: red">ERROR!</p>';
        }

    }, [buttonEl, content, cardId, cardError])

    const style = isActive ? {
        borderColor: theme.palette.warning.main,
        borderWidth: 2
    } :  {
        borderColor: theme.palette.grey["400"]
    }

    function handleClick() {
        if (activeCardId !== cardId) {
            // if (content) {
            //     editor.commands.setContent(content);
            // }
            router.push(deckEditRoute(deckId, cardIndex));
        }
    }

    return (
        <button
            ref={buttonEl}
            className="deck-editor-thumbnail"
            onClick={handleClick}
            style={style}
        />
    )
}