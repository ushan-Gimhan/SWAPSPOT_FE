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

// Get all items with optional filters (Search, Category, Mode)
export const getAllItems = async (params?: { 
  search?: string; 
  category?: string; 
  mode?: string 
}) => {
  const res = await api.get('/items', { params });
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

// Delete an item
export const deleteItem = async (id: string) => {
  const res = await api.delete(`/items/${id}`);
  return res.data;
};

// Optional: AI Price Suggestion (if you keep that endpoint)
export const getAiPriceSuggestion = async (title: string) => {
    const res = await api.post('/items/ai-price', { title });
    return res.data;
};