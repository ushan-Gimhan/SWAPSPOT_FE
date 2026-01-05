import api from './api';

export interface CreateItemPayload {
  title: string;
  description: string;
  category: string;
  condition: string;
  mode: 'SELL' | 'EXCHANGE' | 'CHARITY' | string; // Matches your Enums
  price: number | string;
  seeking: string;
  images: string[]; // Array of ImgBB URLs
  aiSuggestedPrice?: number;
}

// Create a new item (Handles Images + Data)
export const createItem = async (data: any) => {
  // Axios automatically detects that 'data' is a JSON object and sets 
  // 'Content-Type': 'application/json' for you.
  const res = await api.post('/items/create', data);
  return res.data;
};

// Update function signature to accept params object
export const getAllItems = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  mode?: string;
}) => {
  // Axios accepts 'params' which automatically converts to ?page=1&limit=10...
  const res = await api.get('/items/users-item', { params });
  return res.data;
};

// Get a single item by ID
export const getItemById = async (id: string) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

// Update an item (Supports FormData if updating images, or JSON if just text)
export const updateItem = async (id: string, data: Partial<CreateItemPayload>) => {
  const res = await api.put(`/items/${id}`, data);
  return res.data;
};

export const getMyItems = async () => {
  const res = await api.get('/items/my-items');
  return res.data;
};

// Delete an item
export const deleteItem = async (id: string) => {
  const res = await api.delete(`/items/${id}`);
  return res.data;
};

export const getUserItems = async (userId: string) => {
  const res = await api.get(`/items/user/${userId}`);
  return res.data;
}


export const getAiPriceSuggestion = async (
  title: string, 
  category: string, 
  condition: string, 
  description: string,
  imageUrl?: string // The ImgBB URL
) => {
  const res = await api.post('/items/ai-price', { 
    title, 
    category, 
    condition, 
    description, 
    imageUrl 
  });
  return res.data.price; 
};