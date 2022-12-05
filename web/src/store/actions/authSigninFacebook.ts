import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerSignIn } from "./authRegisterGoogle";


const authSigninFacebook = createAppAsyncThunk(
    "auth/signin/facebook",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new FacebookAuthProvider());
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "Failed to sign in with Facebook",
                error
            })
        }
    }
)

export default authSigninFacebook;