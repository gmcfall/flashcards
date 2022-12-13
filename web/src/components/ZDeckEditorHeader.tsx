
import AddIcon from '@mui/icons-material/Add';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/hooks";
import { libraryRoute } from "../model/routes";
import deckPublish from "../store/actions/deckPublish";
import flashcardAdd from "../store/actions/flashcardAdd";
import { HEADER_STYLE } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import { TiptapProps } from "./ZDeckEditor";
import ZDeckNameInput from "./ZDeckNameInput";

function ZAddCardButton() {
    const dispatch = useAppDispatch();

    function handleClick() {
        dispatch(flashcardAdd());
    }
    return (
        <Tooltip title="Add a new Flashcard">
            <IconButton
                onClick={handleClick}
            >
                <AddIcon/>
            </IconButton>

        </Tooltip>
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

function ZDeckEditorButtons(props: TiptapProps) {
    const {editor} = props;

    function handleBoldClick() {
        if (editor) {
            editor.chain().focus().toggleBold().run()
        }
    }

    function handleItalicClick() {
        if (editor) {
            editor.chain().focus().toggleItalic().run()
        }
    }

    function handleBulletClick() {
        if (editor) {
            editor.chain().focus().toggleBulletList().run()
        }
    }

    function handleNumberClick() {
        if (editor) {
            editor.chain().focus().toggleOrderedList().run()
        }
    }

    return (
        <Box sx={HEADER_STYLE}>
            <ZAddCardButton/>            
            <ZPublishButton/>
            <IconButton onClick={handleBoldClick} sx={{marginLeft: "140px"}}>
                <FormatBoldIcon/>
            </IconButton>
            <IconButton onClick={handleItalicClick}>
                <FormatItalicIcon/>
            </IconButton>
            
            <IconButton onClick={handleBulletClick}>
                <FormatListBulletedIcon/>
            </IconButton>
            
            <IconButton onClick={handleNumberClick}>
                <FormatListNumberedIcon/>
            </IconButton>
            
        </Box>
    )
}

function ZPublishButton() {
    const dispatch = useAppDispatch();
    function handleClick() {
        dispatch(deckPublish());
    }
    return (
        <Tooltip title="Publish this deck so that anyone can search for it">
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{marginLeft: "20px"}}
            >
                <PublishIcon/>
            </IconButton>
        </Tooltip>
    )
}

function ZDeckEditorBanner() {
    return (        
        <Box sx={{
            display: 'flex',
            paddingTop: "5px",
            borderBottomWidth: "1px",
            paddingLeft: "2em"
        }}>
            <ZDeckNameInput/>
            <ZAlert/>
            <ZAuthTools>
                <ZLibraryButton/>
            </ZAuthTools>
        </Box>
    )
}


export default function ZDeckEditorHeader(props: TiptapProps) {
    const {editor} = props

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <ZDeckEditorBanner/>
            <ZDeckEditorButtons editor={editor}/>
        </Box>
    )
}