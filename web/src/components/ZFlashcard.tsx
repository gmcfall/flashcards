import { ButtonBase } from "@mui/material";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks/hooks";
import { selectActiveCard } from "../model/flashcard";
import { CardInfo } from "../model/types";
import flashcardSelect from "../store/actions/flashcardSelect";
import { Editor } from '@tiptap/react';
import { useEffect, useRef } from "react";

const cardWidth="15rem";
const cardHeight="10rem";

interface FlashcardProps {
    cardInfo: CardInfo,
    editor: Editor
}
export default function ZFlashcard(props: FlashcardProps) {
    const {cardInfo, editor} = props;

    const dispatch = useDispatch();
    const activeCard = useAppSelector(selectActiveCard);
    const buttonEl = useRef<HTMLButtonElement>(null);

    const card = cardInfo.card;
    const isActive = activeCard === card.id;
    const content = card.content;

    useEffect(()=> {

        const current = buttonEl.current;

        if (current) {
            current.innerHTML = content;
        }

    }, [buttonEl, content])

    const borderColor = isActive ? "warning.main" : "grey.400";
    const borderWidth = isActive ? 2 : 1;

    
    function handleClick() {
        dispatch(flashcardSelect(card.id));
        editor.commands.setContent(content);
    }

    return (
        <ButtonBase
            ref={buttonEl}
            disableRipple
            onClick={handleClick}
            sx={{
                display: "block",
                padding: "1em",
                textAlign: "start",
                fontSize: "70%",
                width: cardWidth,
                height: cardHeight,
                borderWidth,
                borderStyle: 'solid',
                borderColor
            }}
        >
            
        </ButtonBase>
    )
}