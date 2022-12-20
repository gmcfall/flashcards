import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { createEmptySession } from "../../model/auth";
import firebaseApp from "../../model/firebaseApp";
import { AppDispatch } from "../store";
import authSessionBegin from "./authSessionBegin";
import authStateChanged from "./authStateChanged";

let unsubscribe: Unsubscribe | null = null;

export default function authListen() {
    return (dispatch: AppDispatch) => {
        if (!unsubscribe) {
            const auth = getAuth(firebaseApp);
            unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    dispatch(authStateChanged(user));
                } else {
                    dispatch(authSessionBegin(createEmptySession()));
                }
            })
        }
    }
}
