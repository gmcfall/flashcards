import { GoogleAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerSignIn } from "./authRegisterGoogle";


const authSigninGoogle = createAppAsyncThunk(
    "auth/signin/google",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new GoogleAuthProvider());
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "Failed to sign in with Google",
                error
            })
        }
    }
)

export default authSigninGoogle;
