import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const RootStore = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof RootStore.getState>