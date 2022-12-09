import { createAction } from "@reduxjs/toolkit";
import { Flashcard } from "../../model/types";

/**
 * Receive a Flashcard loaded from Firestore
 */
const flashcardReceive = createAction<Flashcard>("flashcard/receive");
export default flashcardReceive;