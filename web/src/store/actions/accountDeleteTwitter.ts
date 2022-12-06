import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { reauthenticateWithProvider } from "./accountDeleteGoogle";

const accountDeleteTwitter = createAppAsyncThunk(
    "account/delete/twitter",
    async (_, thunkApi) => {
        try {
           await reauthenticateWithProvider(new TwitterAuthProvider());
           return true;

        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeleteTwitter;