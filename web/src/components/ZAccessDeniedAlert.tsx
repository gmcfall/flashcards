
import { Alert } from "@mui/material";
import { useData } from "../fbase/hooks";
import { useSessionUser } from "../hooks/customHooks";
import { useAppSelector } from "../hooks/hooks";
import { selectRegistrationState, selectSigninActive } from "../model/auth";
interface AccessDeniedAlertProps {
    children?: React.ReactNode
}
export default function ZAccessDeniedAlert(props: AccessDeniedAlertProps) {

    const {children} = props;

    const user = useSessionUser();
    const registrationState = useAppSelector(selectRegistrationState);
    const signinActive = useData(selectSigninActive);

    if (user || registrationState || signinActive) {
        return null;
    }

    return (
        <Alert severity="info">
            {children}
        </Alert>
    )
}