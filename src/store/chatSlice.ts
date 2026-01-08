import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Participant {
  firstName: string;
  lastName: string; _id: string; fullName: string; avatar: string; email: string; 
}
export interface Item { _id: string; title: string; price: number; images: string[]; }
export interface ChatType { _id: string; participants: Participant[]; itemId?: Item; lastMessage?: string; updatedAt: string; }
export interface Message { _id: string; chat: ChatType | string; sender: Participant | string; text: string; createdAt: string; }

interface ChatState {
  chats: ChatType[];
  selectedChat: ChatType | null;
  messagesCache: Record<string, Message[]>;
  loadingChats: boolean;
  loadingMessages: boolean;
  sending: boolean;
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  messagesCache: {},
  loadingChats: true,
  loadingMessages: false,
  sending: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<ChatType[]>) { state.chats = action.payload; },
    setSelectedChat(state, action: PayloadAction<ChatType | null>) { state.selectedChat = action.payload; },
    setMessagesCache(state, action: PayloadAction<Record<string, Message[]>>) { state.messagesCache = action.payload; },
    addMessageToCache(state, action: PayloadAction<{ chatId: string; message: Message }>) {
      const { chatId, message } = action.payload;
      state.messagesCache[chatId] = [...(state.messagesCache[chatId] || []), message];
    },
    setLoadingChats(state, action: PayloadAction<boolean>) { state.loadingChats = action.payload; },
    setLoadingMessages(state, action: PayloadAction<boolean>) { state.loadingMessages = action.payload; },
    setSending(state, action: PayloadAction<boolean>) { state.sending = action.payload; },
    updateChatLastMessage(state, action: PayloadAction<{ chatId: string; text: string }>) {
      const { chatId, text } = action.payload;
      state.chats = state.chats.map(c => c._id === chatId ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } : c)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }
});

export const { setChats, setSelectedChat, setMessagesCache, addMessageToCache, setLoadingChats, setLoadingMessages, setSending, updateChatLastMessage } = chatSlice.actions;
export default chatSlice.reducer;
