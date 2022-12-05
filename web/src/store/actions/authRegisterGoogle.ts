import { AuthProvider, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession } from "../../model/auth";
import firebaseApp from "../../model/firebaseApp";


const authRegisterGoogle = createAppAsyncThunk(
    "auth/register/google",
    async (_, thunkApi) => {
        try {
            const session = await providerSignIn(new GoogleAuthProvider());
            // TODO: Add workflow to collect display name if not provided
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "Failed to sign in with Google",
                error
            })
        }
    }
)

export async function providerSignIn(provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || undefined;
    const providers = user.providerData.map(data => data.providerId);

    return createSession(uid, providers, displayName);
}


export default authRegisterGoogle;


