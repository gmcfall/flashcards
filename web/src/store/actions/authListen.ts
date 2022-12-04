import { AppDispatch } from "../store";
import firebaseApp from "../../model/firebaseApp";
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { createSession } from "../../model/auth";
import authSessionBegin from "./authSessionBegin";
import authSessionEnd from "./authSessionEnd";

let unsubscribe: Unsubscribe | null = null;

export default function authListen() {
    return (dispatch: AppDispatch) => {
        if (!unsubscribe) {
            const auth = getAuth(firebaseApp);
            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    const uid = user.uid;
                    const displayName = user.displayName || undefined;
                    const providers = user.providerData.map(data => data.providerId);
                    const session = createSession(uid, providers, displayName);
                    dispatch(authSessionBegin(session));
                } else {
                    dispatch(authSessionEnd());
                }
            })
        }
    }
}