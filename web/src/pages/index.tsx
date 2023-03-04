import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { Box, Button, Link as Anchor, Typography } from "@mui/material";
import Link from 'next/link';
import { useAccountIsIncomplete, useSessionUser } from '../hooks/customHooks';
import { libraryRoute } from '../model/routes';
import { HEADER_STYLE, OUTLINED_TEXT_FIELD_HEIGHT } from '../components/header';
import LerniTheme from '../components/lerniTheme';
import ZAccountIncomplete from '../components/ZAccountIncomplete';
import ZAlert from '../components/ZAlert';
import ZAuthTools from '../components/ZAuthTools';
import ZResourceSearchTool from '../components/ZResourceSearchTool';


function ZHomeHeader() {
    return (
        <Box id="homeHeader" sx={{
            ...HEADER_STYLE,
            height: OUTLINED_TEXT_FIELD_HEIGHT,
            alignSelf: "stretch"
        }}>
            
            <Box sx={{marginRight: "20px"}}>
                <Button variant="contained">
                    Create a New Deck
                </Button>
            </Box>
            <ZResourceSearchTool/>
            <ZAlert/>
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
    const accountIsIncomplete = useAccountIsIncomplete();
    if (accountIsIncomplete) {
        return <ZAccountIncomplete/>
    }
   
    return (
        <Box id="homepage" sx={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
            <ZHomeHeader/>
            <Box id="homeContent" 
                sx={{display: "flex", flexDirection: "column", marginTop: '2em'}}
            >
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
    const user = useSessionUser();
    if (!user) {
        return null;
    }
    return (
            <Link href={libraryRoute()}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <LocalLibraryIcon sx={{marginRight: '0.5em'}}/> <span>My Library</span>
                </Box>
            </Link>
    )

}