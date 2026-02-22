import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  raw?: any;
};

export const formatMessages = (messages: any[] = []): ChatMessage[] =>
  messages.map((msg) => ({
    id: nanoid(),
    text: msg?.content || '',
    sender: msg?.role?.toLowerCase() === 'ai' ? 'bot' : 'user',
    raw: msg,
  }));

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    hydrateFromBackend: (state, action: PayloadAction<any[]>) => {
      state.messages = formatMessages(action.payload);
    },
    addUserMessage: {
      reducer: (state: ChatState, action: PayloadAction<ChatMessage>) => {
        state.messages.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: {
          id: nanoid(),
          text,
          sender: 'user' as const,
        },
      }),
    },
    addBotMessage: {
      reducer: (state: ChatState, action: PayloadAction<ChatMessage>) => {
        state.messages.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: {
          id: nanoid(),
          text,
          sender: 'bot' as const,
        },
      }),
    },
  },
});

export const { setMessages, hydrateFromBackend, addUserMessage, addBotMessage } = chatSlice.actions;

export default chatSlice.reducer;
