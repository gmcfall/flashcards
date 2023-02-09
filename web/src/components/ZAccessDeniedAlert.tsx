
import { Alert } from "@mui/material";
import { useContext } from "react";
import { useSessionUser } from "../hooks/customHooks";
import { RegistrationContext } from "./ZRegistrationProvider";
import { SigninContext } from "./ZSigninProvider";
interface AccessDeniedAlertProps {
    children?: React.ReactNode
}
export default function ZAccessDeniedAlert(props: AccessDeniedAlertProps) {

    const {children} = props;

    const user = useSessionUser();
    const [registerActive] = useContext(RegistrationContext);
    const [signinActive] = useContext(SigninContext);

    if (user || registerActive || signinActive) {
        return null;
    }

    return (
        <Alert severity="info">
            {children}
        </Alert>
    )
}