import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createSession } from "../../model/auth";
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

            const session = createSession(user.uid, [], displayName);

            return session;
            
           
        } catch (error) {
            return thunkApi.rejectWithValue({
                message: "An error occurred while creating your account",
                error
            })
        }
    }
)

export default authRegisterEmailFormSubmit;

