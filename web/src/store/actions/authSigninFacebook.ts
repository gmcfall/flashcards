import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { providerSignIn } from "./authRegisterGoogle";


const authSigninFacebook = createAppAsyncThunk(
    "auth/signin/facebook",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new FacebookAuthProvider());
            return session;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred during sign in",
                error
            ))
        }
    }
)

export default authSigninFacebook;
