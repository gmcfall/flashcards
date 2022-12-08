import { Box } from "@mui/material";
import { CardInfo } from "../model/types";

const cardWidth="30em";
const cardHeight="20em";

interface FlashcardProps {
    cardInfo?: CardInfo
}
export default function ZFlashcard(props: FlashcardProps) {

    // TODO render the card content

    return (
        <Box sx={{
            width: cardWidth,
            height: cardHeight,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: "gray.400"
        }}>

        </Box>
    )
}