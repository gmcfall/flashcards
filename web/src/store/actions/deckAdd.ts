import { NavigateFunction } from "react-router-dom";
import { createAppAsyncThunk } from "../../hooks/hooks";
import { createDeck, saveDeck } from "../../model/deck";
import { createErrorInfo } from "../../model/errorHandler";
import { createFlashcardRef, createServerFlashCard } from "../../model/flashcard";
import { deckEditRoute } from "../../model/routes";
import { SessionUser } from "../../model/types";


interface DeckAddProps {
    navigate: NavigateFunction,
    user: SessionUser | null | undefined
}

const deckAdd = createAppAsyncThunk(
    "deck/add",
    async (props: DeckAddProps, thunkApi) => {
        const navigate = props.navigate;
        const user = props.user;
        try {
            if (!user) {
                return thunkApi.rejectWithValue({
                    message: "Cannot create a new Deck because you are not signed-in"
                })
            }
            const deck = createDeck();
            const card = createServerFlashCard(deck.id);
            const cardRef = createFlashcardRef(card.id);
            deck.cards.push(cardRef);

            await saveDeck(user.uid, deck, card);

            navigate(deckEditRoute(deck.id));

            return deck;

        } catch (error) {
            
            return thunkApi.rejectWithValue(createErrorInfo(
                "An error occurred while saving the new Deck",
                error
            ))
        }
    }
)

export default deckAdd;