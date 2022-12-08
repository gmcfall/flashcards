import { ButtonBase } from "@mui/material";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks/hooks";
import { selectActiveCard } from "../model/flashcard";
import { CardInfo } from "../model/types";
import flashcardSelect from "../store/actions/flashcardSelect";

const cardWidth="15em";
const cardHeight="10em";

interface FlashcardProps {
    cardInfo: CardInfo
}
export default function ZFlashcard(props: FlashcardProps) {
    const {cardInfo} = props;

    const dispatch = useDispatch();
    const activeCard = useAppSelector(selectActiveCard);

    const isActive = activeCard === cardInfo.card.id;
    const borderColor = isActive ? "warning.main" : "grey.400";
    const borderWidth = isActive ? 2 : 1;

    
    function handleClick() {
        dispatch(flashcardSelect(cardInfo.card.id));
    }

    return (
        <ButtonBase
            disableRipple
            onClick={handleClick}
            sx={{
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