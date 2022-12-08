import { createAppAsyncThunk } from "../../hooks/hooks";
import { selectDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";
import { createFlashCard, saveFlashcard } from "../../model/flashcard";


const flashcardNew = createAppAsyncThunk(
    "flashcard/new",
    async (_, thunkApi) => {
        try {
          
            const state = thunkApi.getState();
            const deck = selectDeck(state);
            if (deck == null) {
                thunkApi.rejectWithValue(createErrorInfo(
                    "An error occurred while creating the new Flashcard",
                    new Error("Cannot create new Flashcard: deck is undefined")
                ))
                return;
            }
            const card = createFlashCard(deck.id);
            await saveFlashcard(card);

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the new Flashcard",
                error
            ))
        }
    }
)

export default flashcardNew;