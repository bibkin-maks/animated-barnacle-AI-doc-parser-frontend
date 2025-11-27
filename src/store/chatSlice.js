import { createSlice, nanoid } from "@reduxjs/toolkit";

/**
 * Format backend conversation array into Frontend UI messages.
 * Backend format:
 *   [{ role: "user" | "ai", content: "text" }]
 */
export const formatMessages = (messages = []) =>
  messages.map((msg) => ({
    id: nanoid(),
    text: msg?.content || "",
    sender: msg?.role?.toLowerCase() === "ai" ? "bot" : "user",
    raw: msg, // keep raw backend message for future debugging/features
  }));

const chatSlice = createSlice({
  name: "chat",

  initialState: {
    messages: [], // UI-friendly formatted messages
  },

  reducers: {
    /**
     * Replace entire message history (already in UI-friendly format).
     */
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    /**
     * Hydrate messages directly from backend format.
     * Automatically runs formatMessages().
     */
    hydrateFromBackend: (state, action) => {
      state.messages = formatMessages(action.payload);
    },

    /**
     * Add a message sent by the user.
     */
    addUserMessage: {
      reducer: (state, action) => {
        state.messages.push(action.payload);
      },
      prepare: (text) => ({
        payload: {
          id: nanoid(),
          text,
          sender: "user",
        },
      }),
    },

    /**
     * Add a message sent by the AI bot.
     */
    addBotMessage: {
      reducer: (state, action) => {
        state.messages.push(action.payload);
      },
      prepare: (text) => ({
        payload: {
          id: nanoid(),
          text,
          sender: "bot",
        },
      }),
    },
  },
});

export const {
  setMessages,
  hydrateFromBackend,
  addUserMessage,
  addBotMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
