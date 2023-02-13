import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { disownAllLeases } from "../fbase/functions";
import { useEntityApi } from "../fbase/hooks";
import { useAccessControl, useSessionUser } from "../hooks/customHooks";
import { checkPrivilege } from "../model/access";
import { deckEditRoute, deckViewRoute } from "../model/routes";
import { EDIT } from "../model/types";

const DECK_SHARE = "DeckShare";

export default function ZDeckShare() {
    const {deckId} = useParams();
    const api = useEntityApi();
    const navigate = useNavigate();
    const accessControl = useAccessControl(DECK_SHARE, deckId);
    const user = useSessionUser();

    
    useEffect(
        () => () => disownAllLeases(api, DECK_SHARE), [api]
    )

    useEffect(() => {

        if (deckId && user && accessControl) {
            const userUid = user.uid;
            const canEdit = checkPrivilege(EDIT, accessControl, deckId, userUid);
            if (canEdit) {
                navigate(deckEditRoute(deckId));
            } else {
                navigate(deckViewRoute(deckId));
            }
        }

    }, [deckId, user, accessControl, navigate])

    return (
        <Box sx={{display: "flex", justifyContent: "center", marginTop: "50px"}}>
            <Typography>Redirecting...</Typography>
        </Box>
    )
}