import { createAction } from '@reduxjs/toolkit';

/**
 * Fires when the DeckEditor unmounts so that state can
 * be cleaned up.
 */
const deckeditorUnmount = createAction("deckeditor/unmount");
export default deckeditorUnmount;