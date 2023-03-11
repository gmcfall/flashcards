import { AuthOptions, useAuthListener, useDocListener } from "@gmcfall/react-firebase-state";
import { useContext } from "react";
import { RegistrationContext } from "../components/ZRegistrationProvider";
import { SigninContext } from "../components/ZSigninProvider";
import { accessOptions, accessPath } from "../model/access";
import { userProfileIsIncomplete, userTransform } from "../model/auth";
import { identityPath } from "../model/identity";
import { AccessTuple, Identity, SessionUser } from "../model/types";

export function useAccessControl(leasee: string, resourceId?: string) : AccessTuple {

    const path = accessPath(resourceId);
    return useDocListener(leasee, path, accessOptions);

}

const sessionUserOptions: AuthOptions<SessionUser> = {
    transform: userTransform
}

export function useSessionUser() {
    const [user] = useAuthListener(sessionUserOptions);
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

export function useIdentity(leasee: string, userUid: string | undefined) {
    const path = identityPath(userUid);
    return useDocListener<Identity>(leasee, path);
}