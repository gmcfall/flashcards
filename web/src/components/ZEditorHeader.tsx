import { Box } from "@mui/system";
import ZAuthTools from "./ZAuthTools";
import ZDeckTitleInput from "./ZDeckTitleInput";

const headerStyle = {
    display: 'flex'
}

export function ZEditorHeader() {
    return (
        <Box sx={headerStyle}>
            <ZDeckTitleInput/>
            <ZAuthTools/>
        </Box>
    )
}