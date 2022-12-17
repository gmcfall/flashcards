import { createAppAsyncThunk } from "../../hooks/hooks";
import { getAccess as getAccessEnvelope } from "../../model/access";
import { createErrorInfo } from "../../model/errorHandler";
import accessSet from "./accessSet";


interface AccessGetProps {
    resourceId: string;
    withUser?: string
}

const accessGet = createAppAsyncThunk(
    "access/get",
    async (props: AccessGetProps, thunkApi) => {
        const {resourceId, withUser} = props;
        const dispatch = thunkApi.dispatch;
        try {
           const envelope = await getAccessEnvelope(dispatch, resourceId, withUser);
           dispatch(accessSet(envelope))

        } catch (error) {

            // In theory, we should never get here because `getAccessEnvelope` catches 
            // all errors. But, just in case...
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while getting the `acccess` document from Firestore",
                error
            ))
        }
    }
)

export default accessGet;