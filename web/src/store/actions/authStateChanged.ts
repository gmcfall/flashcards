import { User } from "firebase/auth";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { handleAuthStateChanged, selectRegistrationState } from "../../model/auth";
import { createErrorInfo } from "../../model/errorHandler";
import { REGISTER_BEGIN, REGISTER_EMAIL } from "../../model/types";
import authSessionBegin from "./authSessionBegin";


const authStateChanged = createAppAsyncThunk(
    "auth/state/changed",
    async (user: User, thunkApi) => {
        try {
            const state = thunkApi.getState();
            const registerStage = selectRegistrationState(state);

            switch (registerStage) {
                case REGISTER_BEGIN:
                    // ZRegisterWizard is responsible for creating the session.
                    //
                    // In particular, `registerViaProvider` function calls `providerRegister` 
                    // which creates and dispatches the session.
                    break;

                case REGISTER_EMAIL:
                    // ZRegisterWizard is responsible for creating the session.
                    //
                    // In particular, ZRegisterWithEmail (a component within ZRegisterWizard)
                    // invokes `submitEmailRegistrationForm` which creates and dispatches the
                    // session
                    break;

                default: {
                    const session = await handleAuthStateChanged(user);
                    thunkApi.dispatch(authSessionBegin(session));
                }

            }

        } catch (error) {
            console.error("authStateChange", error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "Oops! Your account was not found.",
                new Error(`Failed to handle authStateChanged: uid=${user.uid}, displayName=${user.displayName}`)
            ))
        }
    }
)

export default authStateChanged;