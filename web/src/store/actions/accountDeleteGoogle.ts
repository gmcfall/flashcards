import { AuthProvider, deleteUser, getAuth, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { unsubscribeLerni } from "../../model/lerni";
import { deleteLibrary } from "../../model/library";


const accountDeleteGoogle = createAppAsyncThunk(
    "account/delete/google",
    async (_, thunkApi) => {
        try {
           await reauthenticateWithProvider(new GoogleAuthProvider());
           return true;

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeleteGoogle;

export async function reauthenticateWithProvider(provider: AuthProvider) {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
        throw  new Error("user is not signed in");
    }
    const result = await reauthenticateWithPopup(user, provider);
    const freshUser = result.user;
    unsubscribeLerni();
    await deleteLibrary(freshUser.uid);
    await deleteUser(freshUser);
}