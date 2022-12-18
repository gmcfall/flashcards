import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectCurrentUser } from "../model/auth";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import { REGISTER_BUTTON_LABEL } from "./lerniConstants";

export default function ZRegisterButton() {
    const dispatch = useAppDispatch();

    const user = useAppSelector(selectCurrentUser);
    // Don't display the register button if the user is signed in.
    if (user) {
        return null;
    }

    function handleClick() {
        dispatch(authRegisterBegin());
    }

    return (
        <Button onClick={handleClick}>
            {REGISTER_BUTTON_LABEL}
        </Button>
    )
}