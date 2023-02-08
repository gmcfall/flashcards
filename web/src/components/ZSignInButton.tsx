import { Button } from "@mui/material";
import { useEntityApi } from "../fbase/hooks";
import { useSessionUser } from "../hooks/customHooks";
import { authBeginSignIn } from "../model/auth";
import { SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
import { ZSigninWizard } from "./ZSigninWizard";

export default function ZSignInButton() {
    const api = useEntityApi();
    const user = useSessionUser();
    // Don't display the sign in button if the user is already signed in
    

    function handleClick() {
        authBeginSignIn(api);
    }

    return (
        <>
            {!user && (
                <Button
                    onClick={handleClick}
                >
                    {SIGN_IN_BUTTON_LABEL}
                </Button>
            )}
            <ZSigninWizard/>
        </>
    )
}