import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { reauthenticateWithProvider } from "./accountDeleteGoogle";


const accountDeleteFacebook = createAppAsyncThunk(
    "account/delete/facebook",
    async (callBack: (ok: boolean) => void, thunkApi) => {
        try {
           await reauthenticateWithProvider(callBack, new FacebookAuthProvider());
           return true;

        } catch (error) {
            callBack(false);
            console.log(error);
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeleteFacebook;