import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import authRegisterBegin from "../store/actions/authRegisterBegin";

export default function ZRegisterButton() {
    const dispatch = useAppDispatch();

    const session = useAppSelector(selectSession);
    // Don't display the register button if the user is signed in.
    if (session) {
        return null;
    }

    function handleClick() {
        dispatch(authRegisterBegin());
    }

    return (
        <Button onClick={handleClick}>
            Register
        </Button>
    )
}