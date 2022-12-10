import { NavigateFunction } from "react-router-dom";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { selectSession } from "../../model/auth";
import { createDeck, saveDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";
import { createFlashCard, createFlashcardRef } from "../../model/flashcard";
import { deckEditRoute } from "../../model/routes";


const deckAdd = createAppAsyncThunk(
    "deck/add",
    async (navigate: NavigateFunction, thunkApi) => {
        try {
            const state = thunkApi.getState();
            const session = selectSession(state);
            if (!session) {
                return thunkApi.rejectWithValue({
                    message: "Cannot create a new Deck because you are not signed-in"
                })
            }
            const deck = createDeck();
            const card = createFlashCard(deck.id);
            const cardRef = createFlashcardRef(card.id);
            deck.cards.push(cardRef);

            await saveDeck(session.user.uid, deck, card);

            navigate(deckEditRoute(deck.id));

        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the new Deck",
                error
            ))
        }
    }
)

export default deckAdd;