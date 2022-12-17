import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { createEmptySession, createSession, getRequiresVerification } from "../../model/auth";
import firebaseApp from "../../model/firebaseApp";
import { ANONYMOUS } from "../../model/types";
import { AppDispatch } from "../store";
import authSessionBegin from "./authSessionBegin";

let unsubscribe: Unsubscribe | null = null;

export default function authListen() {
    return (dispatch: AppDispatch) => {
        if (!unsubscribe) {
            const auth = getAuth(firebaseApp);
            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    const uid = user.uid;
                    const displayName = user.displayName || ANONYMOUS;
                    const providers = user.providerData.map(data => data.providerId);
                    const requiresVerification = getRequiresVerification(user);
                    const session = createSession(uid, providers, displayName, requiresVerification);
                    dispatch(authSessionBegin(session));
                } else {
                    dispatch(authSessionBegin(createEmptySession()));
                }
            })
        }
    }
}
