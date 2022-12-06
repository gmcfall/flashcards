import { Box } from "@mui/material";
import ZAlert from "./ZAlert";
import ZAuthToolsWithSessionCheck from "./ZAuthToolsWithSessionCheck";


function ZFlashcardLibraryHeader() {

    return (
        <Box sx={{
            display: 'flex', 
            minHeight: "3em", 
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "grey.400",
        }}>
            <ZAlert/>
            <ZAuthToolsWithSessionCheck/>
        </Box>
    )

}


export default function ZFlashcardLibrary() {

    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZFlashcardLibraryHeader/>
            <h1>Library</h1>
        </Box>
    )
}