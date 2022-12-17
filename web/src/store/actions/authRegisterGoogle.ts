import { AuthProvider, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession, getRequiresVerification } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { createFirestoreLibrary, saveLibrary } from "../../model/library";
import { ANONYMOUS } from "../../model/types";


const authRegisterGoogle = createAppAsyncThunk(
    "auth/register/google",
    async (_, thunkApi) => {
        try {
            const session = await providerRegister(new GoogleAuthProvider());
            // TODO: Add workflow to collect display name if not provided
            return session;
        } catch (error) {
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while creating your account",
                error
            ))
        }
    }
)

export async function providerRegister(provider: AuthProvider) {
    const session = await providerSignIn(provider);
    
    const lib = createFirestoreLibrary();
    if (session.user) {
        await saveLibrary(session.user.uid, lib);
    }

    return session;
}

export async function providerSignIn(provider: AuthProvider) {
    
    const auth = getAuth(firebaseApp);
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const uid = user.uid;
    const displayName = user.displayName || ANONYMOUS;
    const providers = user.providerData.map(data => data.providerId);
    const requiresVerification = getRequiresVerification(user);

    return createSession(uid, providers, displayName, requiresVerification);
}


export default authRegisterGoogle;


