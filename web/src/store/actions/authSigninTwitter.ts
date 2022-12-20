import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerSignIn } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";


const authSigninTwitter = createAppAsyncThunk(
    "auth/signin/twitter",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new TwitterAuthProvider());
            return session;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred during sign in",
                error
            ))
        }
    }
)

export default authSigninTwitter;