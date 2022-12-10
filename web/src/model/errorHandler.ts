import { PayloadAction } from "@reduxjs/toolkit";
import { setAlert } from "./alert";
import { AlertData, LerniApp, ERROR, ErrorInfo } from "./types";

export function doErrorDisplay(lerni: LerniApp, action: PayloadAction<ErrorInfo | undefined>) {
    // TODO: Log the error to the firestore console via a function
    const info = action.payload;
    console.log("ERROR:", info);

    if (info) {
        const alertData: AlertData = {
            severity: ERROR,
            message: info.message
        }

        setAlert(lerni, alertData);
    }

}

export function displayError(lerni: LerniApp, message: string, cause?: string) {
    const data: AlertData = {
        severity: ERROR,
        message
    }
    if (cause) {
        console.log(cause);
    }
    setAlert(lerni, data);
}

export function createErrorInfo(message: string, error: Error | unknown) : ErrorInfo {

    const result : ErrorInfo = {
        message
    }

    if (error instanceof Error) {
        result.cause = error.message;
    }

    return result;
}