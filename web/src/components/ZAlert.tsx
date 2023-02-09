import { Alert } from "@mui/material";
import { useEffect } from 'react';
import { useData, useEntityApi } from "../fbase/hooks";
import { alertRemove, selectAlert } from "../model/alert";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export default function ZAlert() {

    const api = useEntityApi();
    const alertData = useData(selectAlert);

    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (alertData) {
            timeoutId = setTimeout(() => {
                alertRemove(api);
                timeoutId = null;
            }, 10000)
        }

    }, [alertData, api])


    if (!alertData) {
        return null;
    }

    return (
        <Alert className="alert" severity={alertData.severity}>
            {alertData.message}
        </Alert>
    );
}