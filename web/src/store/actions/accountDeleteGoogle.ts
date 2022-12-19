import { AuthProvider, deleteUser, getAuth, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { deleteUserData } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { unsubscribeLerni } from "../../model/lerni";


const accountDeleteGoogle = createAppAsyncThunk(
    "account/delete/google",
    async (_, thunkApi) => {
        try {
           await deleteAccountViaIdentityProvider(new GoogleAuthProvider());
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

export async function deleteAccountViaIdentityProvider(provider: AuthProvider) {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
        throw  new Error("user is not signed in");
    }
    unsubscribeLerni();
    await deleteUserData(user.uid);
    const result = await reauthenticateWithPopup(user, provider);
    const freshUser = result.user;
    await deleteUser(freshUser);
}