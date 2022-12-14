import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { performResourceSearch } from "../../model/search";
import { ResourceSearchRequest } from "../../model/types";


const resourceSearchRequest = createAppAsyncThunk(
    "resource/search/request",
    async (request: ResourceSearchRequest, thunkApi) => {
        try {
            const dispatch = thunkApi.dispatch;
            performResourceSearch(dispatch, request.searchTags);

        } catch (error) {
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while searching",
                error
            ))
        }
    }
)

export default resourceSearchRequest;