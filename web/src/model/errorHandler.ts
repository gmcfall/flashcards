import { PayloadAction } from "@reduxjs/toolkit";
import { DeckApp, ErrorInfo } from "./types";

export function doErrorDisplay(editor: DeckApp, action: PayloadAction<ErrorInfo | undefined>) {
    // TODO: display the error message to the user
    // TODO: Log the error to the firestore console via a function
    const info = action.payload;
    console.log("ERROR:", info);
}