import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { providerSignIn } from "./authRegisterGoogle";


const authRegisterFacebook = createAppAsyncThunk(
    "auth/register/facebook",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new FacebookAuthProvider());
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while creating your account",
                error
            ))
        }
    }
)


export default authRegisterFacebook;


