import { getAuth, signOut } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import firebaseApp from "../../model/firebaseApp";

const authSignout = createAppAsyncThunk(
    "auth/signout",
    async (_, thunkApi) => {
        try {
            const auth = getAuth(firebaseApp);
            await signOut(auth);
            return true;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "Failed to sign in with Google",
                error
            })
        }
    }
)

export default authSignout;