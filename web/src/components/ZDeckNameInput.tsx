import { TextField } from "@mui/material";
import { useSessionUser } from "../hooks/customHooks";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { selectDeck } from "../model/deck";
import deckNameSubmit from "../store/actions/deckNameSubmit";
import deckNameUpdate from "../store/actions/deckNameUpdate";
import { DECK_NAME_INPUT } from "./lerniConstants";

export default function ZDeckNameInput() {
    const dispatch = useAppDispatch();
    const deck = useAppSelector(selectDeck);
    const user = useSessionUser();

    if (!deck || !user) {
        return null;
    }
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
        dispatch(deckNameSubmit({name, deckId}))
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