import { TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectSession } from "../model/auth";
import { selectDeck } from "../model/deck";
import deckNameSubmit from "../store/actions/deckNameSubmit";
import deckNameUpdate from "../store/actions/deckNameUpdate";
import { DECK_NAME_INPUT } from "./lerniConstants";

export default function ZDeckNameInput() {
    const dispatch = useAppDispatch();
    const deck = useAppSelector(selectDeck);
    const session = useAppSelector(selectSession);

    if (!deck || !session) {
        return null;
    }
    const userUid = session.user.uid;
    const deckId = deck.id;

    const name = deck.name;
    const size = Math.max(name.length+1, 30);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        dispatch(deckNameUpdate(e.currentTarget.value));
    }

    function handleKeyUp(e: React.KeyboardEvent) {
        switch (e.key) {
            case 'Enter' : {
                const target = e.nativeEvent.target as any;
                if (target && target.blur) {
                    target.blur()
                }
                break;
            } 
        }
    }

    function handleBlur() {
        dispatch(deckNameSubmit({name, userUid, deckId}))
    }

    return (
        
        <TextField
            className={DECK_NAME_INPUT}
            inputProps={{size}}
            size="small"
            variant="outlined"
            value={deck.name}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
        />
    )
}