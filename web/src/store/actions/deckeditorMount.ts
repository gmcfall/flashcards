import { createAction } from '@reduxjs/toolkit';

/**
 * This action fires when ZDeckEditor mounts.
 */
const deckeditorMount = createAction<string>("deckeditor/mount");
export default deckeditorMount;