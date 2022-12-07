
import { Box } from "@mui/material";
import { HEADER_STYLE } from "./header";
import ZAlert from "./ZAlert";
import ZAuthTools from "./ZAuthTools";
import ZDeckNameInput from "./ZDeckNameInput";


export default function ZDeckEditorHeader() {

    return (
        <Box sx={HEADER_STYLE}>
            <ZDeckNameInput/>
            <ZAlert/>
            <ZAuthTools/>
        </Box>
    )
}