import { PayloadAction } from "@reduxjs/toolkit";
import EntityApi from "../fbase/EntityApi";
import { RootState } from "../store/store";
import { AlertData, ERROR, LerniApp, LerniApp0, SUCCESS } from "./types";

export function doAlertRemove(lerni: LerniApp0, action: PayloadAction) {
    delete lerni.alertData;
}

export function doAlertPost(lerni: LerniApp0, action: PayloadAction<AlertData>) {
    lerni.alertData = action.payload;
}
export function setAlert(lerni: LerniApp0, data: AlertData) {
    lerni.alertData = data;
}

export function selectAlert(state: RootState) {
    return state.lerni.alertData;
}

export function alertError(api: EntityApi, message: string, error: unknown) {
    api.mutate((lerni: LerniApp) => setError(lerni, message, error))
}

export function alertSuccess(api: EntityApi, message: string) {
    api.mutate(
        (lerni: LerniApp) => setSuccess(lerni, message)
    )
}

export function setError(lerni: LerniApp, message: string, error: unknown) {

    console.log(message);
    if (error instanceof Error) {
        console.log("cause:", error.message);
    }
    lerni.alertData = {
        severity: ERROR,
        message
    }
}

export function setSuccess(lerni: LerniApp, message: string) {
    lerni.alertData = {
        severity: SUCCESS,
        message
    }
}