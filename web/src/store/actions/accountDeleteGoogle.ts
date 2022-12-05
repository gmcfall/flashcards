import { AuthProvider, deleteUser, getAuth, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import firebaseApp from "../../model/firebaseApp";


const accountDeleteGoogle = createAppAsyncThunk(
    "account/delete/google",
    async (callBack: (ok: boolean) => void, thunkApi) => {
        try {
           await reauthenticateWithProvider(callBack, new GoogleAuthProvider());
           return true;

        } catch (error) {
            callBack(false);
            console.log(error);
            return thunkApi.rejectWithValue({
                message: "Failed to delete account",
                error
            })
        }
    }
)

export default accountDeleteGoogle;

export async function reauthenticateWithProvider(callBack: (ok: boolean) => void, provider: AuthProvider) {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
        throw  new Error("user is not signed in");
    }
    const result = await reauthenticateWithPopup(user, provider);
    const freshUser = result.user;
    await deleteUser(freshUser);

    callBack(true);
}