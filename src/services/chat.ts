import api from "./api";

// Get my chats
export const fetchMyChats = async () => {
  const res = await api.get("/chat");
  return res.data;
};

// Get messages of a chat
export const fetchMessages = async (chatId: string) => {
  const res = await api.get(`/chat/${chatId}`);
  return res.data;
};

// Send message
export const sendMessage = async (chatId: string, content: string) => {
  const res = await api.post("/chat/message", { chatId, content });
  return res.data;
};

// Access or create chat
export const accessChat = async (userId: string, itemId: string) => {
  const res = await api.post("/chat", { userId, itemId });
  return res.data;
};
