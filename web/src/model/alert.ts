import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { AlertData, DeckApp } from "./types";

export function doAlertRemove(editor: DeckApp, action: PayloadAction) {
    delete editor.alertData;
}

export function setAlert(editor: DeckApp, data: AlertData) {
    editor.alertData = data;
}

export function selectAlert(state: RootState) {
    return state.editor.alertData;
}