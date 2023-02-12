import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useEntityApi } from "../fbase/hooks";
import { useSessionUser } from "../hooks/customHooks";
import { updateDeckName } from "../model/deck";
import { Deck } from "../model/types";
import { DECK_NAME_INPUT } from "./lerniConstants";


interface DeckNameInputProps {
    deck: Deck | undefined;
}
export default function ZDeckNameInput(props: DeckNameInputProps) {
    const {deck} = props;
    const api = useEntityApi();
    const user = useSessionUser();
    const [name, setName] = useState("");

    useEffect(()=>{
        if (deck) {
            setName(deck.name)
        }
    }, [deck])

    const deckId = deck?.id;

    const size = Math.max(name.length+1, 30);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
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
        if (deckId) {
            updateDeckName(api, deckId, name);
        }
    }

    return (
        
        <TextField
            disabled={!deck || !user}
            className={DECK_NAME_INPUT}
            inputProps={{size}}
            size="small"
            variant="outlined"
            value={name}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
        />
    )
}