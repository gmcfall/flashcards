import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession, getRequiresVerification } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { RegisterEmailData } from "../../model/types";


const authRegisterEmailFormSubmit = createAppAsyncThunk(
    "auth/register/emailForm/submit",
    async (props: RegisterEmailData, thunkApi) => {
        try {

            const {email, password, displayName} = props;

            const auth = getAuth(firebaseApp);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {displayName});
            await sendEmailVerification(user);

            const requiresVerification = getRequiresVerification(user);
            const session = createSession(user.uid, [], displayName, requiresVerification);

            return session;
            
           
        } catch (error) {
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while creating your account",
                error
            ))
        }
    }
)

export default authRegisterEmailFormSubmit;

