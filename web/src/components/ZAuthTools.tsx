import { Box } from "@mui/material";
import ZRegisterButton from "./ZRegisterButton";
import ZSignInButton from "./ZSignInButton";
import ZUserTools from "./ZUserTools";

interface AuthToolsProps {
   
    children?: React.ReactNode
}

export default function ZAuthTools(props: AuthToolsProps) {
    const {children} = props;
    return (
        <Box sx={{display: 'inline', marginLeft: 'auto'}}>
            {children}
            <ZRegisterButton/>
            <ZSignInButton/>
            <ZUserTools/>
        </Box>
    )
}