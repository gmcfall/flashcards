
import { Box, Button } from "@mui/material";
import { HEADER_STYLE } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import ZDeckNameInput from "./ZDeckNameInput";
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch } from "../hooks/hooks";
import flashcardNew from "../store/actions/flashcardNew";

function ZAddCardButton() {
    const dispatch = useAppDispatch();

    function handleClick() {
        dispatch(flashcardNew());
    }
    return (
        <Button
            variant="outlined"
            startIcon={<AddIcon/>}
            sx={{marginLeft: "2em"}}
            onClick={handleClick}
        >
            New Flashcard
        </Button>
    )
}


export default function ZDeckEditorHeader() {

    return (
        <Box sx={HEADER_STYLE}>
            <ZDeckNameInput/>
            <ZAddCardButton/>
            <ZAlert/>
            <ZAuthTools/>
        </Box>
    )
}