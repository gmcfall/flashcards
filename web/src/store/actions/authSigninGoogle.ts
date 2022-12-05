import { GoogleAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { providerSignIn } from "./authRegisterGoogle";


const authSigninGoogle = createAppAsyncThunk(
    "auth/signin/google",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new GoogleAuthProvider());
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
