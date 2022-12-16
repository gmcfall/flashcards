import { createAppAsyncThunk } from "../../hooks/hooks";
import { updateAcccess } from "../../model/access";
import { createErrorInfo } from "../../model/errorHandler";
import { Role } from "../../model/types";


interface AccessGeneralChangeProps {
    resourceId: string;
    generalRole?: Role
}

const accessGeneralChange = createAppAsyncThunk(
    "access/general/change",
    async (props: AccessGeneralChangeProps, thunkApi) => {
        const {resourceId, generalRole} = props;

        try {
           await updateAcccess(resourceId, generalRole);
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the sharing settings",
                error
            ))
        }
    }
)

export default accessGeneralChange;