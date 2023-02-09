import React, { useState } from "react";
import { ZRegisterWizard } from "./ZRegisterWizard";
import { BooleanState } from "../model/types";


function dummy(value: boolean) {}

export const RegistrationContext = React.createContext<BooleanState>([false, dummy]);

interface RegistrationProviderProps {
    children?: React.ReactNode;
}


export default function ZRegistrationProvider(props: RegistrationProviderProps) {
    const {children} = props;
    const value = useState(false);
    const open = value[0];
    const setOpen = value[1];

    return (
        <RegistrationContext.Provider value={value}>
            {children}
            {open && (
                <ZRegisterWizard
                    setOpen={setOpen}
                />
            )}
        </RegistrationContext.Provider>
    )
}