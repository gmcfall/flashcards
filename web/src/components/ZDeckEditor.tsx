import { Box } from "@mui/material";
import ZDeckEditorHeader from "./ZDeckEditorHeader";

export function ZDeckEditorContent() {
    return (
        <Box></Box>
    )
}

export default function ZDeckEditor() {
    
    return (
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <ZDeckEditorHeader/>
            <Box id="contentRoot" sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box id="contentContainer" sx={{maxWidth: "50rem", minWidth: "20rem"}}>
                    <ZDeckEditorContent/>
                </Box>
            </Box>
        </Box>
    )
}