import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import { useEffect } from "react"
import authRegisterBegin from "../store/actions/authRegisterBegin";

/**
 * Check if a session is active and pop-up the registration
 * wizard if there is no session
 */
export default function ZSessionCheck() {

    const session = useAppSelector(selectSession);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!session) {
            dispatch(authRegisterBegin())
        }
    }, [session, dispatch])

    return null;

}