import { getAuth, updateProfile } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";

const accountDisplayNameUpdate = createAppAsyncThunk(
    "account/displayName/update",
    async (displayName: string, thunkApi) => {
        try {
            const auth = getAuth(firebaseApp);
            if (!auth.currentUser) {
                throw new Error("Not signed in");
            }
            await updateProfile(auth.currentUser, {displayName});

            return displayName;

        } catch (error) {
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving your profile",
                error
            ))
        }
    }
)

export default accountDisplayNameUpdate;