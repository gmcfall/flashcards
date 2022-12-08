import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { AlertData, LerniApp } from "./types";

export function doAlertRemove(lerni: LerniApp, action: PayloadAction) {
    delete lerni.alertData;
}

export function doAlertPost(lerni: LerniApp, action: PayloadAction<AlertData>) {
    lerni.alertData = action.payload;
}
export function setAlert(lerni: LerniApp, data: AlertData) {
    lerni.alertData = data;
}

export function selectAlert(state: RootState) {
    return state.lerni.alertData;
}