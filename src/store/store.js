import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";

// ========================================================================
// Redux Store
// ========================================================================
export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },

  // If you need custom middleware later (logger, API listener, etc.)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // can turn on if needed
    }),

  devTools: process.env.NODE_ENV !== "production",
});

// Optional helpers if you move to TS later
export const getState = () => store.getState();
export const dispatch = store.dispatch;
