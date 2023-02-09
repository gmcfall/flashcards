import React, { useState } from "react";
import { ZRegisterWizard } from "../components/ZRegisterWizard";


function dummy(value: boolean) {

}

export const RegistrationContext = React.createContext(dummy);

interface RegistrationProviderProps {
    children?: React.ReactNode;
}

export default function ZRegistrationProvider(props: RegistrationProviderProps) {
    const {children} = props;
    const [open, setOpen] = useState(false);

    return (
        <RegistrationContext.Provider value={setOpen}>
            {children}
            {open && (
                <ZRegisterWizard
                    setOpen={setOpen}
                />
            )}
        </RegistrationContext.Provider>
    )
}