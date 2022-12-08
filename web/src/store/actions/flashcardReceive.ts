import { createAction } from "@reduxjs/toolkit";
import { ServerFlashcard } from "../../model/types";

/**
 * Receive a Flashcard loaded from Firestore
 */
const flashcardReceive = createAction<ServerFlashcard>("flashcard/receive");
export default flashcardReceive;