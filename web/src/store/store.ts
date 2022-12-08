import { configureStore } from '@reduxjs/toolkit';
import lerniReducer from './reducers/lerniReducer';

const store = configureStore({
    reducer: {
        lerni: lerniReducer
    }
})
export default store;

// Declare app specific types for the root state, dispatch function, `useDispatch` and `useSelector`.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch