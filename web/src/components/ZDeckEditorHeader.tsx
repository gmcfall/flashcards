
import { Box } from "@mui/material";
import { HEADER_STYLE } from "./header";
import ZAlert from "./ZAlert";
import ZAuthToolsWithSessionCheck from "./ZAuthToolsWithSessionCheck";

export default function ZDeckEditorHeader() {

    return (
        <Box sx={HEADER_STYLE}>
            <ZAlert/>
            <ZAuthToolsWithSessionCheck/>
        </Box>
    )
}