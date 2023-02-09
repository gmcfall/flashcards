import { Button } from "@mui/material";
import { useContext } from "react";
import { useSessionUser } from "../hooks/customHooks";
import { SIGN_IN_BUTTON_LABEL } from "./lerniConstants";
import { SigninContext } from "./ZSigninProvider";

export default function ZSignInButton() {
    const user = useSessionUser();
    const [,setSigninOpen] = useContext(SigninContext);
    // Don't display the sign in button if the user is already signed in
    

    function handleClick() {
        setSigninOpen(true);
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
        </>
    )
}