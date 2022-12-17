import { createAccessEnvelope, selectDeckAccessEnvelope } from "../model/access";
import { selectSession } from "../model/auth";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useEffect} from "react";
import accessSet from "../store/actions/accessSet";
import { ACCESS_DENIED, NOT_FOUND, UNKNOWN_ERROR } from "../model/types";
import accessGet from "../store/actions/accessGet";
import authListen from "../store/actions/authListen";

export function useAccessControl(resourceId?: string) {


    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    const deckAccess = useAppSelector(selectDeckAccessEnvelope);
    

    useEffect(() => {
        if (resourceId) {
            if (!deckAccess) {
                const envelope = createAccessEnvelope(resourceId);
                dispatch(accessSet(envelope));
            } else if (session && !deckAccess.payload) {

                const error = deckAccess.error;
                const userUid = session?.user?.uid;
                switch (error) {
                    case UNKNOWN_ERROR:
                        // Do nothing.
                        // Subsequent get attempts will almost certainly fail.
                        break;
    
                    case NOT_FOUND:
                        // Do nothing. 
                        // Subsequent get attempts will certainly fail.
                        break;
    
                    case undefined:
                        // There is no payload and no error.
                        // Issue the first get request.
                        // console.log("first get", {userUid});
                        dispatch(accessGet({resourceId, withUser: userUid}));
                        break;
    
                    case ACCESS_DENIED:
                        if (userUid && userUid!==deckAccess.withUser) {
                            // Try another get request, but this time with the user
                            // currently signed in.
                            // console.log("second get");
                            dispatch(accessGet({resourceId, withUser: userUid}))
                        }
                        break;
                }
            }
        }
    }, [resourceId, dispatch, session, deckAccess])

    if (resourceId && deckAccess && deckAccess.resourceId !== resourceId) {
        return undefined;
    }
    return resourceId ? deckAccess : undefined;
}

export function useSession() {

    const dispatch = useAppDispatch();
    const session = useAppSelector(selectSession);
    useEffect(() => {
        dispatch(authListen())
    }, [dispatch])

    return session;

}