import React, { useState } from "react";
import { BooleanState } from "../model/types";
import { ZSigninWizard } from "./ZSigninWizard";

function dummy(value: boolean) {}

export const SigninContext = React.createContext<BooleanState>([false, dummy]);


interface SigninProviderProps {
    children?: React.ReactNode;
}

export default function ZSigninProvider(props: SigninProviderProps) {

    const {children} = props;
    const value = useState(false);
    const open = value[0];

    return (
        <SigninContext.Provider value={value}>
            {children}
            {open && (
                <ZSigninWizard/>
            )}

        </SigninContext.Provider>
    )
}