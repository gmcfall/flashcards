
import { Alert } from "@mui/material";
import { useContext } from "react";
import { useSessionUser } from "../hooks/customHooks";
import { useAppSelector } from "../hooks/hooks";
import { selectRegistrationState } from "../model/auth";
import { SigninContext } from "./ZSigninProvider";
interface AccessDeniedAlertProps {
    children?: React.ReactNode
}
export default function ZAccessDeniedAlert(props: AccessDeniedAlertProps) {

    const {children} = props;

    const user = useSessionUser();
    const registrationState = useAppSelector(selectRegistrationState);
    const [signinActive] = useContext(SigninContext);

    if (user || registrationState || signinActive) {
        return null;
    }

    return (
        <Alert severity="info">
            {children}
        </Alert>
    )
}