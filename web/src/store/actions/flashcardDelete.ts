import { createAppAsyncThunk } from "../../hooks/hooks";
import { selectDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";
import { deleteFlashcard, selectActiveCard } from "../../model/flashcard";


const flashcardDelete = createAppAsyncThunk(
    "flashcard/delete",
    async (_, thunkApi) => {
        try {
          
            const state = thunkApi.getState();
            const deck = selectDeck(state);
            if (deck == null) {                
                throw new Error("Cannot delete Flashcard: `deck` is undefined");
            }
            
            const cardId = selectActiveCard(state);
            if (!cardId) {
                return;
            }

            await deleteFlashcard(deck, cardId);

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting the Flashcard",
                error
            ))
        }
    }
)

export default flashcardDelete;