import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAccessControl, useSession } from "../hooks/customHooks";
import { useAppDispatch } from "../hooks/hooks";
import { checkPrivilege } from "../model/access";
import { deckEditRoute, deckViewRoute } from "../model/routes";
import { EDIT } from "../model/types";

export default function ZDeckShare() {
    const {deckId} = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const accessControl = useAccessControl(deckId);
    const session = useSession();

    useEffect(() => {

        if (deckId && session && accessControl) {
            const userUid = session.user?.uid;
            const canEdit = checkPrivilege(EDIT, accessControl, deckId, userUid);
            if (canEdit) {
                navigate(deckEditRoute(deckId));
            } else {
                navigate(deckViewRoute(deckId));
            }
        }

    }, [deckId, session, accessControl, dispatch, navigate])

    return (
        <Box sx={{display: "flex", justifyContent: "center", marginTop: "50px"}}>
            <Typography>Redirecting...</Typography>
        </Box>
    )
}