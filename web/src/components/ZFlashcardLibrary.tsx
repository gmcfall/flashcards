import { Box, Typography } from "@mui/material";
import ZAlert from "./ZAlert";
import ZAuthToolsWithSessionCheck from "./ZAuthToolsWithSessionCheck";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';


function ZFlashcardLibraryHeader() {

    return (
        <Box sx={{
            display: 'flex', 
            minHeight: "3em", 
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "grey.400",
            alignItems: 'center',
            paddingLeft: "2em"
        }}>
            <LocalLibraryIcon/>
            <Typography variant="h1" sx={{marginLeft: "1rem"}}>Library</Typography>
            <ZAlert/>
            <ZAuthToolsWithSessionCheck/>
        </Box>
    )
}


export default function ZFlashcardLibrary() {

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZFlashcardLibraryHeader/>
        </Box>
    )
}