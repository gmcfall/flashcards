import { PayloadAction } from "@reduxjs/toolkit";
import { setAlert } from "./alert";
import { AlertData, DeckApp, ERROR, ErrorInfo } from "./types";

export function doErrorDisplay(editor: DeckApp, action: PayloadAction<ErrorInfo | undefined>) {
    // TODO: Log the error to the firestore console via a function
    const info = action.payload;
    console.log("ERROR:", info);

    if (info) {
        const alertData: AlertData = {
            severity: ERROR,
            message: info.message
        }

        setAlert(editor, alertData);
    }

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