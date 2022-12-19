import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { providerRegister } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";


const authRegisterFacebook = createAppAsyncThunk(
    "auth/register/facebook",
    async (_, thunkApi) => {
        try {
            const session = await providerRegister(thunkApi.dispatch, new FacebookAuthProvider());
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


