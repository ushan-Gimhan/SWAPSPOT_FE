import api from './api'; // Ensure this points to your axios instance with the token interceptor

// Matches Backend: router.post('/', authenticate, accessChat);
export const accessChat = async (userId: string, itemId: string) => {
  // Body: { userId, itemId }
  const res = await api.post('/chat', { userId, itemId });
  return res.data;
};

// Matches Backend: router.get('/:chatId', authenticate, allMessages);
export const fetchMessages = async (chatId: string) => {
  const res = await api.get(`/chat/${chatId}`);
  return res.data;
};

// Matches Backend: router.post('/message', authenticate, sendMessage);
export const sendMessage = async (chatId: string, content: string) => {
  // Body: { chatId, content }
  const res = await api.post('/chat/message', { chatId, content });
  return res.data;
};

export const fetchMyChats = async () => {
  const res = await api.get('/chat/user-chats');
  return res.data;
}