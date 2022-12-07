import { createAppAsyncThunk } from "../../hooks/hooks";
import { deleteDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";


interface DeckDeleteProps {
    deckId: string,
    userUid: string
}

const deckDelete = createAppAsyncThunk(
    "deck/delete",
    async (props: DeckDeleteProps, thunkApi) => {
        const {deckId, userUid} = props;
        try {

            await deleteDeck(deckId, userUid);

            return true;

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while deleting the deck",
                error
            ))
        }
    }
)

export default deckDelete;