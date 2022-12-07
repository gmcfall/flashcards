import { createAppAsyncThunk } from "../../hooks/hooks";
import { selectSession } from "../../model/auth";
import { createDeck, saveDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";


const deckNew = createAppAsyncThunk(
    "deck/new",
    async (_, thunkApi) => {
        try {
            const state = thunkApi.getState();
            const session = selectSession(state);
            if (!session) {
                return thunkApi.rejectWithValue({
                    message: "Cannot create a new Deck because you are not signed-in"
                })
            }
            const deck = createDeck();
            await saveDeck(session.user.uid, deck);

        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the new Deck",
                error
            ))
        }
    }
)

export default deckNew;