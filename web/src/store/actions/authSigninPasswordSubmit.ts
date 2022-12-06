import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession, getRequiresVerification } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { ANONYMOUS, PasswordCredentials } from "../../model/types";


const authSigninPasswordSubmit = createAppAsyncThunk(
    "auth/signin/password/submit",
    async (props: PasswordCredentials, thunkApi) => {
        try {
            const {email, password} = props;

            const auth = getAuth(firebaseApp);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const providers = user.providerData.map(data => data.providerId);
            const displayName = user.displayName || ANONYMOUS;

            const requiresVerification = getRequiresVerification(user);

            const session = createSession(user.uid, providers, displayName, requiresVerification);
            return session;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred during sign in",
                error
            ))
        }
    }
)

export default authSigninPasswordSubmit;