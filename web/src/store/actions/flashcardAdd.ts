import { createAppAsyncThunk } from "../../hooks/hooks";
import { selectDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";
import { createFlashCard, saveFlashcard } from "../../model/flashcard";


const flashcardAdd = createAppAsyncThunk(
    "flashcard/new",
    async (_, thunkApi) => {
        try {
          
            const state = thunkApi.getState();
            const deck = selectDeck(state);
            if (deck == null) {                
                throw new Error("Cannot create new Flashcard: deck is undefined");
            }
            const card = createFlashCard(deck.id);
            await saveFlashcard(card);

            return card.id;

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the new Flashcard",
                error
            ))
        }
    }
)

export default flashcardAdd;