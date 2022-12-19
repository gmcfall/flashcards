import { Box } from "@mui/material";
import ZRegisterButton from "./ZRegisterButton";
import ZSignInButton from "./ZSignInButton";
import ZSigninDialog from "./ZSigninDialog";
import ZUserTools from "./ZUserTools";

interface AuthToolsProps {
    /**
     * When true, the registration dialog will not render a
     * cancel button in the header, and it will not be possible to
     * close the dialog by clicking on the background or pressing [Esc].
     */
    disableRegisterCancel?: boolean,

    /**
     * A callback that fires when the sign-in dialog closes
     */
    onCloseSignInDialog?: () => void,
    children?: React.ReactNode
}

export default function ZAuthTools(props: AuthToolsProps) {
    const {onCloseSignInDialog, children} = props;
    return (
        <Box sx={{display: 'inline', marginLeft: 'auto'}}>
            {children}
            <ZRegisterButton/>
            <ZSignInButton/>
            <ZUserTools/>
            <ZSigninDialog onClose={onCloseSignInDialog}/>
        </Box>
    )
}