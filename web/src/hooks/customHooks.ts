import { useContext, useEffect } from "react";
import { RegistrationContext } from "../components/ZRegistrationProvider";
import { SigninContext } from "../components/ZSigninProvider";
import { AuthOptions, useAuthListener } from "../fbase/hooks";
import { createAccessEnvelope, selectDeckAccessEnvelope } from "../model/access";
import { userProfileIsIncomplete, userTransform } from "../model/auth";
import { ACCESS_DENIED, NOT_FOUND, SessionUser, UNKNOWN_ERROR } from "../model/types";
import accessGet from "../store/actions/accessGet";
import accessSet from "../store/actions/accessSet";
import { useAppDispatch, useAppSelector } from "./hooks";

export function useAccessControl(resourceId?: string) {


    const dispatch = useAppDispatch();
    const user = useSessionUser();
    const deckAccess = useAppSelector(selectDeckAccessEnvelope);
    

    useEffect(() => {
        if (resourceId) {
            if (!deckAccess) {
                const envelope = createAccessEnvelope(resourceId);
                dispatch(accessSet(envelope));
            } else if (user && !deckAccess.payload) {

                const error = deckAccess.error;
                const userUid = user?.uid;
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
    }, [resourceId, dispatch, user, deckAccess])

    if (resourceId && deckAccess && deckAccess.resourceId !== resourceId) {
        return undefined;
    }
    return resourceId ? deckAccess : undefined;
}

const sessionUserOptions: AuthOptions<SessionUser> = {
    transform: userTransform
}

export function useSessionUser() {
    const [, user] = useAuthListener(sessionUserOptions);
    return user;
}

export function useAccountIsIncomplete() {
    const [registerWizardIsOpen] = useContext(RegistrationContext);
    const [signinWizardIsOpen] = useContext(SigninContext);
    const user = useSessionUser();
    return Boolean(
        !registerWizardIsOpen &&
        !signinWizardIsOpen &&
        user &&
        (
            userProfileIsIncomplete(user) ||
            user.requiresEmailVerification
        )
    )
}