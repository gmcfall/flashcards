
import AddIcon from '@mui/icons-material/Add';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PublicIcon from '@mui/icons-material/Public';
import PublishIcon from '@mui/icons-material/Publish';
import { useRouter } from 'next/router';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Tooltip
} from "@mui/material";
import { Editor } from '@tiptap/core';
import { useState } from "react";
import { useEntityApi } from '@gmcfall/react-firebase-state';
import { useAccessControl, useSessionUser } from '../hooks/customHooks';
import { checkPrivilege, getSharingIconType } from '../model/access';
import { getCardList, publishDeck, updateDeckName } from '../model/deck';
import { addFlashcard } from '../model/flashcard';
import { libraryRoute } from "../model/routes";
import { AccessTuple, ClientFlashcard, Deck, DeckQuery, GLOBE, LOCK_OPEN, SHARE, SharingIconType, UNTITLED_DECK } from '../model/types';
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import { DECK_EDITOR } from './deckEditorShared';
import ZDeckNameInput from "./ZDeckNameInput";
import { ZSharingDialog } from './ZSharingDialog';

function ZAddCardButton() {

    const router = useRouter();
    const {deckId} = router.query as DeckQuery;
    const api = useEntityApi();

    function handleClick() {
        if (deckId) {
            addFlashcard(api, router, deckId);
        }
    }
    return (
        <Tooltip title="Add a new Flashcard">
            <IconButton
                disabled={!deckId}
                onClick={handleClick}
            >
                <AddIcon/>
            </IconButton>

        </Tooltip>
    )
}

function ZLibraryButton() {
    const router = useRouter();

    function handleClick() {
        router.push(libraryRoute())
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

interface DeckEditorButtonsProps {
    editor: Editor | null;
    deck: Deck | undefined;
}

function ZDeckEditorButtons(props: DeckEditorButtonsProps) {
    const {editor, deck} = props;

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
            {deck && (      
                <ZPublishButton deck={deck}/>
            )}  
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

interface PublishButtonProps {
    deck: Deck
}
function ZPublishButton(props: PublishButtonProps) {

    const {deck} = props;
    const api = useEntityApi();
    const [nameDialogOpen, setNameDialogOpen] = useState<boolean>(false);
    const cardList = deck ? getCardList(api, deck) : null;

    if (!deck || !cardList) {
        return null;
    }
    
    function handleClick() {
        if (deck && cardList) {
            if (invalidDeckName(deck.name)) {
                setNameDialogOpen(true);
                return;
            }
            publishDeck(api, deck.id, deck.name, cardList);
        }
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
            {nameDialogOpen && (
                <ZConfirmNameDialog
                    setNameDialogOpen={setNameDialogOpen}
                    deck={deck}
                    cardList={cardList}
                />
            )}
        </>
    )
}

interface ConfirmNameDialogProps {
    setNameDialogOpen: (value: boolean) => void;
    deck: Deck;
    cardList: ClientFlashcard[];
}

function ZConfirmNameDialog(props: ConfirmNameDialogProps) {
    const {setNameDialogOpen, deck, cardList} = props;
    const api = useEntityApi();
    const [name, setName] = useState(deck.name);
    const [nameError, setNameError] = useState<boolean>(false);

    function handleCloseDialog() {
        setNameDialogOpen(false);
    }

    function handleCloseDialogAndPublish() {
        if (deck && cardList) {
            if (invalidDeckName(name)) {
                setNameError(true);
            } else {
                setNameDialogOpen(false);
                
                updateDeckName(api, deck.id, name);
                publishDeck(api, deck.id, name, cardList);
            }
            
        }
    }

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (deck) {
            const name = e.currentTarget.value;
            setName(name);
        }
    }

    return (
        <Dialog open={true} onClose={handleCloseDialog}>
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
                    value={name}
                    helperText={nameError ? "The name is required" : undefined}
                    onChange={handleNameChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleCloseDialogAndPublish}>Publish</Button>
            </DialogActions>
        </Dialog>
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

interface ShareButtonProps {
    accessTuple: AccessTuple;
    deck: Deck | undefined;
}

function ZShareButton(props: ShareButtonProps) {
    const {accessTuple, deck} = props;
    const router = useRouter();
    const {deckId} = router.query as DeckQuery;
    const [open, setOpen] = useState<boolean>(false);
    const shareIconType = getSharingIconType(accessTuple);
    const accessControl = useAccessControl(DECK_EDITOR, deckId);
    const user = useSessionUser();

    const userUid = user?.uid;
    const canShare = checkPrivilege(SHARE, accessControl, deckId, userUid);

    if (!canShare) {
        return null;
    }

    
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
                        accessTuple={accessTuple}
                        deck={deck}
                    />
                ) : undefined
            }
        </>
    )

}

interface DeckEditorBannerProps {
    accessTuple: AccessTuple;
    deck: Deck | undefined;
}
function ZDeckEditorBanner(props: DeckEditorBannerProps) {
    const {accessTuple, deck} = props;
    return (  
              
        <Box sx={{
            display: 'flex', 
            alignItems: 'center',
            paddingLeft: "2em",
            height: OUTLINED_TEXT_FIELD_HEIGHT
        }}>
            <ZDeckNameInput deck={deck}/>
            <ZAlert/>
            <ZAuthTools>
                <ZLibraryButton/>
                <ZShareButton accessTuple={accessTuple} deck={deck}/>
            </ZAuthTools>
        </Box>
    )
}

interface DeckEditorHeaderProps {
    editor: Editor | null;
    deck: Deck | undefined;
    accessTuple: AccessTuple;
}


export default function ZDeckEditorHeader(props: DeckEditorHeaderProps) {
    const {editor, deck, accessTuple} = props

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <ZDeckEditorBanner accessTuple={accessTuple} deck={deck}/>
            <ZDeckEditorButtons editor={editor} deck={deck}/>
        </Box>
    )
}