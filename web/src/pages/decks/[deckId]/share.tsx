import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccessControl, useSessionUser } from "../../../hooks/customHooks";
import { checkPrivilege } from "../../../model/access";
import { deckEditRoute, deckViewRoute } from "../../../model/routes";
import { DeckQuery, EDIT } from "../../../model/types";

const DECK_SHARE = "DeckShare";

export default function ZDeckShare() {
    const router = useRouter();
    const {deckId} = router.query as DeckQuery;
    const accessControl = useAccessControl(DECK_SHARE, deckId);
    const user = useSessionUser();

    useEffect(() => {

        if (deckId && user && accessControl) {
            const userUid = user.uid;
            const canEdit = checkPrivilege(EDIT, accessControl, deckId, userUid);
            if (canEdit) {
                router.push(deckEditRoute(deckId));
            } else {
                router.push(deckViewRoute(deckId));
            }
        }

    }, [deckId, user, accessControl, router])

    return (
        <Box sx={{display: "flex", justifyContent: "center", marginTop: "50px"}}>
            <Typography>Redirecting...</Typography>
        </Box>
    )
}