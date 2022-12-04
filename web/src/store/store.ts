import { configureStore } from '@reduxjs/toolkit';
import deckEditorReducer from './reducers/deckEditorReducer';

const store = configureStore({
    reducer: {
        editor: deckEditorReducer
    }
})
export default store;

// Declare app specific types for the root state, dispatch function, `useDispatch` and `useSelector`.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch