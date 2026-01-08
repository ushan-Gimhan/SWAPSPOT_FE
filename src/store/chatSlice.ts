// store/chatSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  chats: any[];
  selectedChat: any | null;
  messagesCache: Record<string, any[]>;
  loadingChats: boolean;
  loadingMessages: boolean;
  sending: boolean;
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  messagesCache: {},
  loadingChats: false,
  loadingMessages: false,
  sending: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<any[]>) {
      state.chats = action.payload;
    },
    setSelectedChat(state, action: PayloadAction<any>) {
      state.selectedChat = action.payload;
    },
    setMessagesCache(state, action: PayloadAction<Record<string, any[]>>) {
      state.messagesCache = action.payload;
    },
    addMessageToCache(
      state,
      action: PayloadAction<{ chatId: string; message: any }>
    ) {
      const { chatId, message } = action.payload;
      if (!state.messagesCache[chatId]) {
        state.messagesCache[chatId] = [];
      }
      state.messagesCache[chatId].push(message);
    },
    updateChatLastMessage(
      state,
      action: PayloadAction<{ chatId: string; text: string }>
    ) {
      const chat = state.chats.find((c) => c._id === action.payload.chatId);
      if (chat) chat.lastMessage = action.payload.text;
    },
    setLoadingChats(state, action: PayloadAction<boolean>) {
      state.loadingChats = action.payload;
    },
    setLoadingMessages(state, action: PayloadAction<boolean>) {
      state.loadingMessages = action.payload;
    },
    setSending(state, action: PayloadAction<boolean>) {
      state.sending = action.payload;
    },
  },
});

export const {
  setChats,
  setSelectedChat,
  setMessagesCache,
  addMessageToCache,
  updateChatLastMessage,
  setLoadingChats,
  setLoadingMessages,
  setSending,
} = chatSlice.actions;

export default chatSlice.reducer;
