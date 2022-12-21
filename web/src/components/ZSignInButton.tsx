import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectCurrentUser } from "../model/auth";
import authSignin from "../store/actions/authSignin";
import { SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
import { ZSigninWizard } from "./ZSigninWizard";

export default function ZSignInButton() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    // Don't display the sign in button if the user is already signed in
    

    function handleClick() {
        dispatch(authSignin(true));
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