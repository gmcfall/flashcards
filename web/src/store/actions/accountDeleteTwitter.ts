import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { reauthenticateWithProvider } from "./accountDeleteGoogle";

const accountDeleteTwitter = createAppAsyncThunk(
    "account/delete/twitter",
    async (callBack: (ok: boolean) => void, thunkApi) => {
        try {
           await reauthenticateWithProvider(callBack, new TwitterAuthProvider());
           return true;

        } catch (error) {
            callBack(false);
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeleteTwitter;