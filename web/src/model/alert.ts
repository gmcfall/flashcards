import EntityApi from "../fbase/EntityApi";
import { ERROR, INFO, LerniApp, SUCCESS } from "./types";


export function selectAlert(lerni: LerniApp) {
    return lerni.alertData;
}

export function alertError(api: EntityApi, message: string, error?: unknown) {
    api.mutate((lerni: LerniApp) => setError(lerni, message, error))
}

export function alertInfo(api: EntityApi, message: string) {
    api.mutate((lerni: LerniApp) => setInfo(lerni, message));
}

export function setInfo(lerni: LerniApp, message: string) {
    lerni.alertData = {
        severity: INFO,
        message
    }
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

export function alertRemove(api: EntityApi) {
    api.mutate(
        (lerni: LerniApp) => {
            delete lerni.alertData
        }
    )
}