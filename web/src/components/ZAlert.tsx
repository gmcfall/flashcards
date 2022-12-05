import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectAlert } from "../model/alert";
import { Alert } from "@mui/material";
import { useEffect } from 'react';
import alertRemove from "../store/actions/alertRemove";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export default function ZAlert() {

    const dispatch = useAppDispatch();

    const alertData = useAppSelector(selectAlert);

    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (alertData) {
            timeoutId = setTimeout(() => {
                dispatch(alertRemove())
                timeoutId = null;
            }, 10000)
        }

    }, [alertData, dispatch])


    if (!alertData) {
        return null;
    }

    return (
        <Alert className="alert" severity={alertData.severity}>
            {alertData.message}
        </Alert>
    );
}