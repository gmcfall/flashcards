import { getAuth, signOut } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";

const authSignout = createAppAsyncThunk(
    "auth/signout",
    async (_, thunkApi) => {
        try {
            const auth = getAuth(firebaseApp);
            await signOut(auth);
            return true;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred during sign in",
                error
            ))
        }
    }
)

export default authSignout;