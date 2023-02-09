import { Button } from "@mui/material";
import { useContext } from "react";
import { RegistrationContext } from "../fbase/ZRegistrationProvider";
import { useSessionUser } from "../hooks/customHooks";
import { REGISTER_BUTTON_LABEL } from "./lerniConstants";


export default function ZRegisterButton() {

    const [,setRegisterOpen] = useContext(RegistrationContext);
    const user = useSessionUser();
   

    function handleClick() {
        setRegisterOpen(true);
    }

    // Don't render the button if the user is signed in.
    return (
        <>
            {!user && (
                <Button onClick={handleClick}>
                    {REGISTER_BUTTON_LABEL}
                </Button>
            )}
        </>
    )
}