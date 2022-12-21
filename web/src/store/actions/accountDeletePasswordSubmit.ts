import { deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { deleteUserData } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { unsubscribeLerni } from "../../model/lerni";
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

            // TODO: add error handlers for deleteUserData

            await deleteUserData(freshUser.uid);
            await deleteUser(freshUser);
           
            unsubscribeLerni();
           
           return true;

        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting your account",
                error
            ))
        }
    }
)

export default accountDeletePasswordSubmit;