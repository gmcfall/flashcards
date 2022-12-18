import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectCurrentUser } from "../model/auth";
import authSigninBegin from "../store/actions/authSigninBegin";
import { SIGN_IN_BUTTON_LABEL } from "./lerniConstants";

export default function ZSignInButton() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    // Don't display the sign in button if the user is already signed in
    if (user) {
        return null;
    }

    function handleClick() {
        dispatch(authSigninBegin());
    }

    return (
        <Button
            onClick={handleClick}
        >
            {SIGN_IN_BUTTON_LABEL}
        </Button>
    )
}