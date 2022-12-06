import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, FormControl, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectSession } from '../model/auth';
import authRegisterCancel from '../store/actions/authRegisterCancel';
import ZAlert from './ZAlert';
import ZAuthTools from './ZAuthTools';
import ZRegisterDialog from './ZRegisterDialog';
import ZSigninDialog from './ZSigninDialog';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { LIBRARY } from '../model/routes';

const CenteredPaper = styled(Paper)(({theme}) => ({
    ...theme.typography.body1,
    textAlign: 'center',
    height: '100%'
}))


function ZHomeHeader() {
    return (
        <Box sx={{
            display: 'flex', 
            minHeight: "3em", 
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "grey.400",
        }}>
            <ZAlert/>
            <ZAuthTools/>
        </Box>
    )
}

export default function ZFlashcardHome() {

    const dispatch = useAppDispatch();


    function handleSetRegisterDialogOpen(isOpen: boolean) {
        if (!isOpen) {
            dispatch(authRegisterCancel())
        }
    }
   
    return (
        <CenteredPaper elevation={0}>
            <ZHomeHeader/>
            <FormControl variant="standard" sx={{marginTop: '2em'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: '2em', alignItems: "center"}}>

                    <Typography variant="body1">
                        Use the search to find flashcard decks, or create a new deck. 
                    </Typography>
                    <TextField
                        id="input-with-icon-textfield"
                        label="Search"
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <SearchIcon />
                            </InputAdornment>
                        ),
                        }}
                        variant="outlined"
                        inputProps={{
                            size: 30
                        }}
                    />
                    <Box>
                        <Button variant="contained">
                            Create a New Deck
                        </Button>
                    </Box>
                    <ZLibraryLink/>
                    
                </Box>
            </FormControl>
            <ZRegisterDialog setOpen={handleSetRegisterDialogOpen}/>
            <ZSigninDialog/>
        </CenteredPaper>
    )
}

function ZLibraryLink() {
    const session = useAppSelector(selectSession);
    if (!session) {
        return null;
    }
    return (
            <Link to={LIBRARY}>
            <Box sx={{display: "flex", alignItems: "center"}}>
                <LocalLibraryIcon sx={{marginRight: '0.5em'}}/> <span>My Library</span>
            </Box>
            </Link>
    )

}