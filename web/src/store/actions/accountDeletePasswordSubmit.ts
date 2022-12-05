import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import firebaseApp from "../../model/firebaseApp";
import { PasswordCredentials } from "../../model/types";


const accountDeletePasswordSubmit = createAppAsyncThunk(
    "account/delete/password/submit",
    async (props: PasswordCredentials, thunkApi) => {
        try {
            const {email, password} = props;
            const auth = getAuth(firebaseApp);
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Cannot delete account because the user is not signed in");
            }
            const credential = EmailAuthProvider.credential(email, password);

            const result = await reauthenticateWithCredential(user, credential);
            const freshUser = result.user;

            await deleteUser(freshUser);
           
           return true;

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue({
                message: "Failed to delete account",
                error
            })
        }
    }
)

export default accountDeletePasswordSubmit;