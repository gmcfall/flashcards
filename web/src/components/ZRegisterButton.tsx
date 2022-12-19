import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectCurrentUser } from "../model/auth";
import authRegisterBegin from "../store/actions/authRegisterBegin";
import { REGISTER_BUTTON_LABEL } from "./lerniConstants";
import { ZRegisterWizard } from "./ZRegisterWizard";


export default function ZRegisterButton() {
    

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
   

    function handleClick() {
        dispatch(authRegisterBegin());
    }

    // Don't render the button if the user is signed in.
    return (
        <>
            {!user && (
                <Button onClick={handleClick}>
                    {REGISTER_BUTTON_LABEL}
                </Button>
            )}
            <ZRegisterWizard />
        </>
    )
}