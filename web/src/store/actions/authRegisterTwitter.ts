import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { providerRegister } from "./authRegisterGoogle";


const authRegisterTwitter = createAppAsyncThunk(
    "auth/register/twitter",
    async (_, thunkApi) => {
        try {
            const session = await providerRegister(new TwitterAuthProvider());
            return session;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while creating your account",
                error
            ))
        }
    }
)


export default authRegisterTwitter;