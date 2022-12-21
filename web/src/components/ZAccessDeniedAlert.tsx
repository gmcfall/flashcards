
import { Alert } from "@mui/material";
import { useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSession, selectSigninActive } from "../model/auth";
interface AccessDeniedAlertProps {
    children?: React.ReactNode
}
export default function ZAccessDeniedAlert(props: AccessDeniedAlertProps) {

    const {children} = props;

    const session = useAppSelector(selectSession);
    const registrationState = useAppSelector(selectRegistrationState);
    const signinActive = useAppSelector(selectSigninActive);

    if (session || registrationState || signinActive) {
        return null;
    }

    return (
        <Alert severity="info">
            {children}
        </Alert>
    )
}