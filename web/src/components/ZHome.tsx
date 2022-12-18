import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Box, Button, Typography, Link as Anchor } from "@mui/material";
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { selectSession } from '../model/auth';
import { libraryRoute } from '../model/routes';
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from './header';
import LerniTheme from './lerniTheme';
import ZAlert from './ZAlert';
import ZAuthTools from './ZAuthTools';
import ZResourceSearchTool from './ZResourceSearchTool';


function ZHomeHeader() {
    return (
        <Box id="homeHeader" sx={{
            ...HEADER_STYLE,
            height: OUTLINED_TEXT_FIELD_HEIGHT,
            alignSelf: "stretch"
        }}>
            <ZAlert/>
            
            <Box sx={{marginRight: "20px"}}>
                <Button variant="contained">
                    Create a New Deck
                </Button>
            </Box>
            <ZResourceSearchTool/>
            <ZAuthTools/>
        </Box>
    )
}

function ZHomeFooter() {
    return (
        <Box id="homeFooter" sx={{
            marginTop: "auto",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: LerniTheme.dividerColor,
            width: "100%"
        }}>
            <Box sx={{padding: "10px"}}>
                <Anchor underline='hover' href='attributions.html'>
                    <Typography variant="body2">Attributions</Typography>
                </Anchor>
            </Box>
        </Box>
    )
}

export default function ZHome() {
   
    return (
        <Box id="homepage" sx={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
            <ZHomeHeader/>
            <Box id="homeContent" sx={{display: "flex", flexDirection: "column", marginTop: '2em'}}>
                <Typography variant="body1">
                    Use the search to find flashcard decks, or create a new deck. 
                </Typography>
                <ZLibraryLink/>
            </Box>
            <ZHomeFooter/>
        </Box>
    )
}

function ZLibraryLink() {
    const session = useAppSelector(selectSession);
    if (!session) {
        return null;
    }
    return (
            <Link to={libraryRoute()}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <LocalLibraryIcon sx={{marginRight: '0.5em'}}/> <span>My Library</span>
                </Box>
            </Link>
    )

}