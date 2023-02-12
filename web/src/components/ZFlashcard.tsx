import { useTheme } from "@mui/material";
import { generateHTML } from "@tiptap/html";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEntity } from "../fbase/hooks";
import { cardPath } from "../model/flashcard";
import { deckEditRoute } from "../model/routes";
import { ClientFlashcard } from "../model/types";
import { TIP_TAP_EXTENSIONS } from "./deckEditorConstants";

interface FlashcardProps {
    activeCardId: string | undefined;
    deckId: string;
    cardId: string;
    cardIndex: number;
}
export default function ZFlashcard(props: FlashcardProps) {
    const {activeCardId, deckId, cardId, cardIndex} = props;
    const navigate = useNavigate();
    const theme = useTheme();
    const buttonEl = useRef<HTMLButtonElement>(null);
    const path = cardPath(cardId);
    const [, card, cardError] = useEntity<ClientFlashcard>(path);
    const isActive = activeCardId === cardId;
    const content = card && card.content;

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
            navigate(deckEditRoute(deckId, cardIndex));
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