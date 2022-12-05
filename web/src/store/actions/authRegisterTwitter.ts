import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerSignIn } from "./authRegisterGoogle";


const authRegisterTwitter = createAppAsyncThunk(
    "auth/register/twitter",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new TwitterAuthProvider());
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "Failed to sign in with Twitter",
                error
            })
        }
    }
)


export default authRegisterTwitter;