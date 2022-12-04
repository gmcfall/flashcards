import { deleteUser, getAuth, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import firebaseApp from "../../model/firebaseApp";


const accountDeleteGoogle = createAppAsyncThunk(
    "account/delete/google",
    async (callBack: (ok: boolean) => void, thunkApi) => {
        try {
            const auth = getAuth(firebaseApp);
            const user = auth.currentUser;
            if (!user) {
                throw  new Error("user is not signed in");
            }
            const provider = new GoogleAuthProvider();
            const result = await reauthenticateWithPopup(user, provider);
            const freshUser = result.user;
            await deleteUser(freshUser);

            callBack(true);
            
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