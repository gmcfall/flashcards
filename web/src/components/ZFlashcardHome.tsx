import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, FormControl, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useAppDispatch } from '../hooks/hooks';
import authRegisterCancel from '../store/actions/authRegisterCancel';
import ZAlert from './ZAlert';
import ZAuthTools from './ZAuthTools';
import ZRegisterDialog from './ZRegisterDialog';
import ZSigninDialog from './ZSigninDialog';

const CenteredPaper = styled(Paper)(({theme}) => ({
    ...theme.typography.body1,
    textAlign: 'center',
    height: '100%'
}))

const instructions = {
    marginBottom: '2em'
}

const buttonBox = {
    marginTop: '2em',
    marginBottom: '2em'
}

function ZHomeHeader() {
    return (
        <Paper>
            <Box sx={{display: 'flex', minHeight: "3em"}}>
                <ZAlert/>
                <ZAuthTools/>
            </Box>
        </Paper>
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
                <Typography variant="body1" sx={instructions}>
                    You can search for a deck of flashcards, or create a new deck. 
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
                <Box sx={buttonBox}>
                    <Button 
                        variant="contained"
                    >
                        Create a New Deck
                    </Button>
                </Box>
            </FormControl>
            <ZRegisterDialog setOpen={handleSetRegisterDialogOpen}/>
            <ZSigninDialog/>
        </CenteredPaper>
    )
}