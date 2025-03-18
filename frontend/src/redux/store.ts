// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slice/userSlice";
import adminSlice from "./slice/adminSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    admin: adminSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
