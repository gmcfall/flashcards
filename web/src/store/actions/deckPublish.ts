import { createAppAsyncThunk } from "../../hooks/hooks";
import { publishDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";


const deckPublish = createAppAsyncThunk(
    "deck/publish",
    async (_, thunkApi) => {
        try {
            const state = thunkApi.getState();
            await publishDeck(state.lerni);
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while publishing the deck",
                error
            ))
        }
    }
)

export default deckPublish;