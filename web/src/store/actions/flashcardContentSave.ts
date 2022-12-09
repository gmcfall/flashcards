import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import { saveFlashcardContent } from "../../model/flashcard";

const flashcardContentSave = createAppAsyncThunk(
    "flashcard/content/save",
    async (activeId: string | null, thunkApi) => {
        try {
            const state = thunkApi.getState();
            await saveFlashcardContent(state.lerni, activeId)
            return true;
        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving flashcard edits",
                error
            ))
        }
    }
)

export default flashcardContentSave;