import { doc, getFirestore, writeBatch } from "firebase/firestore";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { DECKS, METADATA } from "../../model/firestoreConstants";


interface DeckNameSubmitProps {
    name: string,
    deckId: string
}

const deckNameSubmit = createAppAsyncThunk(
    "deck/name/submit",
    async (props: DeckNameSubmitProps, thunkApi) => {
        const {name, deckId} = props;
        try {

            const db = getFirestore(firebaseApp);

            const deckRef = doc(db, DECKS, deckId);
            const metaRef = doc(db, METADATA, deckId);

            const nameRecord = {name};

            const batch = writeBatch(db);
            batch.update(deckRef, nameRecord);
            batch.update(metaRef, nameRecord);

            await batch.commit();

          
            return true;

        } catch (error) {
            console.log(error);
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the deck name",
                error
            ))
        }
    }
)

export default deckNameSubmit;