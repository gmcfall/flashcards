import { GoogleAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerSignIn } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";


const authSigninGoogle = createAppAsyncThunk(
    "auth/signin/google",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new GoogleAuthProvider());
            
            if (!session) {
                return thunkApi.rejectWithValue(createErrorInfo(
                    "Sign-in failed",
                    null
                ))
            }
            return session;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred during sign in",
                error
            ))
        }
    }
)

export default authSigninGoogle;
