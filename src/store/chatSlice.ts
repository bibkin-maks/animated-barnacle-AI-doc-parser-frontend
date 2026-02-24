import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: number;
  raw?: any;
};

export const formatMessages = (messages: any[] = []): ChatMessage[] =>
  messages.map((msg, i) => ({
    id: nanoid(),
    text: msg?.content || '',
    sender: msg?.role?.toLowerCase() === 'ai' ? 'bot' : 'user',
    timestamp: msg?.timestamp ?? Date.now() - (messages.length - i) * 60000,
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
      prepare: (textOrObj: string | { text: string; timestamp?: number }) => {
        const text = typeof textOrObj === 'string' ? textOrObj : textOrObj.text;
        const timestamp = typeof textOrObj === 'object' ? (textOrObj.timestamp ?? Date.now()) : Date.now();
        return { payload: { id: nanoid(), text, sender: 'user' as const, timestamp } };
      },
    },
    addBotMessage: {
      reducer: (state: ChatState, action: PayloadAction<ChatMessage>) => {
        state.messages.push(action.payload);
      },
      prepare: (textOrObj: string | { text: string; timestamp?: number }) => {
        const text = typeof textOrObj === 'string' ? textOrObj : textOrObj.text;
        const timestamp = typeof textOrObj === 'object' ? (textOrObj.timestamp ?? Date.now()) : Date.now();
        return { payload: { id: nanoid(), text, sender: 'bot' as const, timestamp } };
      },
    },
  },
});

export const { setMessages, hydrateFromBackend, addUserMessage, addBotMessage } = chatSlice.actions;

export default chatSlice.reducer;
