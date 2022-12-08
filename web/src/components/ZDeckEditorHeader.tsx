
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { HEADER_STYLE } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import ZDeckNameInput from "./ZDeckNameInput";
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch } from "../hooks/hooks";
import flashcardNew from "../store/actions/flashcardNew";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useNavigate } from "react-router-dom";
import { libraryRoute } from "../model/routes";

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

function ZLibraryButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate(libraryRoute())
    }

    return (
        <Tooltip title="Library">
            <IconButton 
                size="small" 
                sx={{marginRight: "1em"}}
                onClick={handleClick}
            >
                <LocalLibraryIcon/>
            </IconButton>

        </Tooltip>
    )
}


export default function ZDeckEditorHeader() {


    return (
        <Box sx={HEADER_STYLE}>
            <ZDeckNameInput/>
            <ZAddCardButton/>
            <ZAlert/>
            <ZAuthTools>
                <ZLibraryButton/>
            </ZAuthTools>
        </Box>
    )
}