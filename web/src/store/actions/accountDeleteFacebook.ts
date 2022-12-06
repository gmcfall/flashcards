import { FacebookAuthProvider } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { reauthenticateWithProvider } from "./accountDeleteGoogle";


const accountDeleteFacebook = createAppAsyncThunk(
    "account/delete/facebook",
    async (_, thunkApi) => {
        try {
           await reauthenticateWithProvider(new FacebookAuthProvider());
           return true;

        } catch (error) {
            console.log(error);
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeleteFacebook;