import { PayloadAction } from "@reduxjs/toolkit";
import { DeckApp } from "./types";


export function doAccountDisplayNameUpdate(editor: DeckApp, action: PayloadAction<string>) {
    if (editor.session) {
        editor.session.user.displayName=action.payload;
    }
}