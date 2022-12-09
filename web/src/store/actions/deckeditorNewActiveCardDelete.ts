import { createAction } from '@reduxjs/toolkit';

/**
 * This action deletes the `lerni.deckEditor.newActiveCard` flag after the content
 * for the newly "active" card content has been set in the TipTap editor.
 */
const deckeditorNewActiveCardDelete = createAction("deckeditor/newActiveCard/delete");
export default deckeditorNewActiveCardDelete;