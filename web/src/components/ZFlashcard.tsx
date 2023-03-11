import { EntityApi, useEntityApi } from "@gmcfall/react-firebase-state";
import { useTheme } from "@mui/material";
import Collaboration from "@tiptap/extension-collaboration";
import { Editor, EditorOptions } from "@tiptap/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import * as Y from 'yjs';
import { CARDS, DECKS } from "../model/firestoreConstants";
import { deckEditRoute } from "../model/routes";
import { EditorProvider, TiptapMap } from "../model/types";
import FirestoreProvider from "../yjs/FirestoreProvider";
import { TIP_TAP_EXTENSIONS, updateCardFontSize } from "./deckEditorShared";
import { DECK_EDITOR_TIPTAP } from "./lerniConstants";



function createTipTapEditor(provider: FirestoreProvider, setSentinel: (value: object) => void) {
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
            // For now, update the font size of the active card whenever any
            // card changes (whether active or not). If this presents a performance
            // problem, we can refactor to update the font size only if
            // it is the active card that was updated.
            updateCardFontSize();
            setSentinel({});
        }
    }

    return new Editor(options);
}

function createEditorProvider(api: EntityApi, deckId: string, cardId: string, setSentinel: (value: object) => void) : EditorProvider {
    const ydoc = new Y.Doc();

    const provider = new FirestoreProvider(api.firebaseApp, ydoc, [DECKS, deckId, CARDS, cardId]);
    const editor = createTipTapEditor(provider, setSentinel);

    return {editor, provider};
}

interface FlashcardProps {
    editorProviders: TiptapMap;
    setEditorProvider: (cardId: string, value: EditorProvider) => void;
    activeCardId: string | undefined;
    deckId: string;
    cardId: string;
    cardIndex: number;
}

export default function ZFlashcard(props: FlashcardProps) {
    const {activeCardId, deckId, cardId, cardIndex, editorProviders, setEditorProvider} = props;
    const router = useRouter();
    const theme = useTheme();
    const api = useEntityApi();
    const buttonEl = useRef<HTMLButtonElement>(null);
    const [,setSentinel] = useState<object>({});
    const buttonCurrent = buttonEl?.current;
    const isActive = activeCardId === cardId;
    const ep = editorProviders[cardId];
    const cardError = ep ? ep.provider.error : null;
    const htmlContent = ep ? ep.editor.getHTML() : null;


    useEffect(() => {
        const editorProvider = editorProviders[cardId];
        if (!editorProvider) {
            const value = createEditorProvider(api, deckId, cardId, setSentinel);
            setEditorProvider(cardId, value);
        }
    }, [api, deckId, cardId, editorProviders, setEditorProvider])

    useEffect(()=> {
        
        if (buttonCurrent) {
            if (cardError) {
                buttonCurrent.innerHTML = '<p style="color: red">ERROR!</p>';
            } else if (htmlContent) {
                buttonCurrent.innerHTML = htmlContent;
            }
        }

    }, [buttonCurrent, htmlContent, cardError])

    const style = isActive ? {
        borderColor: theme.palette.warning.main,
        borderWidth: 2
    } :  {
        borderColor: theme.palette.grey["400"]
    }

    function handleClick() {
        if (activeCardId !== cardId) {
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