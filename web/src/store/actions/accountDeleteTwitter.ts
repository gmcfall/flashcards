import { TwitterAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { reauthenticateWithProvider } from "./accountDeleteGoogle";

const accountDeleteTwitter = createAppAsyncThunk(
    "account/delete/twitter",
    async (callBack: (ok: boolean) => void, thunkApi) => {
        try {
           await reauthenticateWithProvider(callBack, new TwitterAuthProvider());
           return true;

        } catch (error) {
            callBack(false);
            console.log(error);
            return thunkApi.rejectWithValue({
                message: "Failed to delete account",
                error
            })
        }
    }
)

export default accountDeleteTwitter;