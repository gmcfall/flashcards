import { useTheme } from "@mui/material";
import { Editor } from '@tiptap/react';
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectActiveCard } from "../model/flashcard";
import { CardInfo } from "../model/types";
import flashcardContentSave from "../store/actions/flashcardContentSave";
import flashcardSelect from "../store/actions/flashcardSelect";
import { generateHTML } from "@tiptap/html";
import { TIP_TAP_EXTENSIONS } from "./deckEditorConstants";

interface FlashcardProps {
    cardInfo: CardInfo,
    editor: Editor
}
export default function ZFlashcard(props: FlashcardProps) {
    const {cardInfo, editor} = props;

    const dispatch = useAppDispatch();
    const theme = useTheme();
    const activeCard = useAppSelector(selectActiveCard);
    const buttonEl = useRef<HTMLButtonElement>(null);

    const card = cardInfo.card;
    const isActive = activeCard === card.id;
    const content = card.content;

    useEffect(()=> {

        const current = buttonEl.current;

        if (current) {
            const htmlContent = generateHTML(content, TIP_TAP_EXTENSIONS);
            current.innerHTML = htmlContent;
        }

    }, [buttonEl, content])

    const style = isActive ? {
        borderColor: theme.palette.warning.main,
        borderWidth: 2
    } :  {
        borderColor: theme.palette.grey["400"]
    }

    function handleClick() {
        if (activeCard !== card.id) {
            if (activeCard) {
                dispatch(flashcardContentSave(activeCard))
            }
            dispatch(flashcardSelect(card.id));
            
            editor.commands.setContent(content);
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