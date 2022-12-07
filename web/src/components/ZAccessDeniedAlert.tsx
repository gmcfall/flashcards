
import { Alert } from "@mui/material";
import { useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninState } from "../model/auth";
interface AccessDeniedAlertProps {
    children?: React.ReactNode
}
export default function ZAccessDeniedAlert(props: AccessDeniedAlertProps) {

    const {children} = props;

    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signinState = useAppSelector(selectSigninState);

    if (session || registrationState || signinState) {
        return null;
    }

    return (
        <Alert severity="info">
            {children}
        </Alert>
    )
}