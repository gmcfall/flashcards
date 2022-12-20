import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession, getRequiresVerification } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { getIdentity } from "../../model/identity";
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

            const requiresVerification = getRequiresVerification(user);

            const identity = await getIdentity(user.uid);
            if (!identity) {
                const auth = getAuth(firebaseApp);
                signOut(auth).catch(
                    error => {
                        if (error instanceof Error) {
                            console.log(error.message);
                        }
                    }
                )
                return thunkApi.rejectWithValue(createErrorInfo(
                    "An error occurred during sign in",
                    new Error(`identity not found for user. uid=${user.uid}, displayName=${user.displayName}`)
                ))
            }

            const session = createSession(user.uid, providers, identity.username, identity.displayName, requiresVerification);
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