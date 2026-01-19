import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import calendarReducer from "../slices/calendarSlice";
import { api } from "../slices/apiSlice";

// ========================================================================
// Redux Store
// ========================================================================
export const store = configureStore({
  reducer: {
    chat: chatReducer,
    calendar: calendarReducer,
    [api.reducerPath]: api.reducer, // ✅ REQUIRED
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),

  devTools: process.env.NODE_ENV !== "production",
});

// Optional helpers
export const getState = () => store.getState();
export const dispatch = store.dispatch;
