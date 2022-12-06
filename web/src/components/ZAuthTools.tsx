import ZRegisterButton from "./ZRegisterButton";
import ZUserTools from "./ZUserTools";
import { Box } from "@mui/material";
import ZSignInButton from "./ZSignInButton";
import { useAppDispatch } from "../hooks/hooks";
import authRegisterCancel from "../store/actions/authRegisterCancel";
import ZRegisterDialog from "./ZRegisterDialog";
import ZSigninDialog from "./ZSigninDialog";

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
    onCloseSignInDialog?: () => void
}

export default function ZAuthTools(props: AuthToolsProps) {
    const {disableRegisterCancel, onCloseSignInDialog} = props;
    const dispatch = useAppDispatch();
    function handleSetRegisterDialogOpen(isOpen: boolean) {
        if (!isOpen) {
            dispatch(authRegisterCancel())
        }
    }
    return (
        <Box sx={{display: 'inline', marginLeft: 'auto'}}>
            <ZRegisterButton/>
            <ZSignInButton/>
            <ZUserTools/>
            <ZRegisterDialog 
                setOpen={handleSetRegisterDialogOpen}
                disableCancel={disableRegisterCancel}
            />
            <ZSigninDialog onClose={onCloseSignInDialog}/>
        </Box>
    )
}