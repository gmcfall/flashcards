import ZRegisterButton from "./ZRegisterButton";
import ZUserTools from "./ZUserTools";
import { Box } from "@mui/material";
import ZSignInButton from "./ZSignInButton";


export default function ZAuthTools() {
    return (
        <Box sx={{display: 'inline', marginLeft: 'auto'}}>
            <ZRegisterButton/>
            <ZSignInButton/>
            <ZUserTools/>
        </Box>
    )
}