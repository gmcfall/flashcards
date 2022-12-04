import { getAuth, updateProfile } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
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
            return thunkApi.rejectWithValue({
                message: "Failed to save your display name",
                error
            })
        }
    }
)

export default accountDisplayNameUpdate;