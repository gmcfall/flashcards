import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession } from "../../model/auth";
import firebaseApp from "../../model/firebaseApp";
import { PasswordCredentials } from "../../model/types";


const authSigninPasswordSubmit = createAppAsyncThunk(
    "auth/signin/password/submit",
    async (props: PasswordCredentials, thunkApi) => {
        try {
            const {email, password} = props;

            const auth = getAuth(firebaseApp);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const providers = user.providerData.map(data => data.providerId);
            const displayName = user.displayName || "Anonymous";

            const session = createSession(user.uid, providers, displayName);
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "An error occurred during the sign in process",
                error
            })
        }
    }
)

export default authSigninPasswordSubmit;