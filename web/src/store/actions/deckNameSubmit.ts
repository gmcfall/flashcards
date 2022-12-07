import { doc, FieldPath, getFirestore, updateDoc } from "firebase/firestore";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createErrorInfo } from "../../model/errorHandler";
import firebaseApp from "../../model/firebaseApp";
import { DECKS, LIBRARIES, RESOURCES } from "../../model/firestoreConstants";


interface DeckNameSubmitProps {
    name: string,
    deckId: string,
    userUid: string
}

const deckNameSubmit = createAppAsyncThunk(
    "deck/name/submit",
    async (props: DeckNameSubmitProps, thunkApi) => {
        const {name, deckId, userUid} = props;
        try {

            const db = getFirestore(firebaseApp);

            const deckRef = doc(db, DECKS, deckId);
            const deckPromise = updateDoc(deckRef, {name});

            const libRef = doc(db, LIBRARIES, userUid);
            const path = new FieldPath(RESOURCES, deckId, 'name');
            const libPromise = updateDoc(libRef, path, name);
          
            await Promise.all([deckPromise, libPromise]);
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