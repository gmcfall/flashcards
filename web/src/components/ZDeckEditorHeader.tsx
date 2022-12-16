
import AddIcon from '@mui/icons-material/Add';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PublishIcon from '@mui/icons-material/Publish';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { 
    Box, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, 
    DialogActions, TextField, Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectDeck, selectSharingIcon } from '../model/deck';
import { libraryRoute } from "../model/routes";
import { GLOBE, LOCK_OPEN, SharingIconType, UNTITLED_DECK } from '../model/types';
import deckPublish from "../store/actions/deckPublish";
import flashcardAdd from "../store/actions/flashcardAdd";
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import { TiptapProps } from "./ZDeckEditor";
import ZDeckNameInput from "./ZDeckNameInput";
import { useState } from "react";
import deckNameUpdate from '../store/actions/deckNameUpdate';
import deckNameSubmit from '../store/actions/deckNameSubmit';
import { ZSharingDialog } from './ZSharingDialog';

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

export function invalidDeckName(name: string) {
    const lowerName = name.toLocaleLowerCase();
    return !lowerName || lowerName===UNTITLED_DECK.toLocaleLowerCase();
}

function ZPublishButton() {
    const dispatch = useAppDispatch();
    const [nameDialogOpen, setNameDialogOpen] = useState<boolean>(false);
    const [nameError, setNameError] = useState<boolean>(false);

    const deck = useAppSelector(selectDeck);

    if (!deck) {
        return null;
    }
    
    function handleClick() {
        if (deck) {
            if (invalidDeckName(deck.name)) {
                setNameDialogOpen(true);
                return;
            }
        }
        dispatch(deckPublish());
    }

    function handleCloseDialog() {
        setNameDialogOpen(false);
    }

    function handleCloseDialogAndPublish() {
        if (deck) {
            if (invalidDeckName(deck.name)) {
                setNameError(true);
            } else {
                setNameDialogOpen(false);
                
                dispatch(deckNameSubmit({
                    name: deck.name, 
                    deckId: deck.id
                }))
                dispatch(deckPublish())
            }
            
        }
    }

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        dispatch(deckNameUpdate(e.currentTarget.value));
    }

    return (
        <>
            <Tooltip title="Publish this deck so that anyone can search for it">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{marginLeft: "20px"}}
                >
                    <PublishIcon/>
                </IconButton>
            </Tooltip>

            <Dialog open={nameDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Name before publishing</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Give your untitled Deck a name before it's published:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        error={nameError}
                        size="small"
                        id="name"
                        fullWidth
                        variant="outlined"
                        value={deck ? deck.name : ""}
                        helperText={nameError ? "The name is required" : undefined}
                        onChange={handleNameChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleCloseDialogAndPublish}>Publish</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}


function shareIcon(shareIconType: SharingIconType) {
    switch (shareIconType) {
        case GLOBE:
            return <PublicIcon/>

        case LOCK_OPEN: 
            return <LockOpenIcon/>

        default:
            return <LockIcon/>
    }
}

function ZShareButton() {

    const [open, setOpen] = useState<boolean>(false);
    const shareIconType = useAppSelector(selectSharingIcon);
    
    function handleClick() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    return (
        <>
            <Button
                variant='contained'
                startIcon={shareIcon(shareIconType)}
                onClick={handleClick}
                color="warning"
                sx={{
                    marginRight: "20px"
                }}
            >
                Share
            </Button>
            {
                open ? (
                    <ZSharingDialog
                        open={open}
                        onClose={handleClose}
                    />
                ) : undefined
            }
        </>
    )

}

function ZDeckEditorBanner() {
    return (  
              
        <Box sx={{
            display: 'flex', 
            alignItems: 'center',
            paddingLeft: "2em",
            height: OUTLINED_TEXT_FIELD_HEIGHT
        }}>
            <ZDeckNameInput/>
            <ZAlert/>
            <ZAuthTools>
                <ZLibraryButton/>
                <ZShareButton/>
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