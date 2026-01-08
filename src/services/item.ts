import api from './api';

export interface CreateItemPayload {
  title: string;
  description: string;
  category: string;
  condition: string;
  mode: 'SELL' | 'EXCHANGE' | 'CHARITY' | string;
  price: number | string;
  seeking: string;
  images: string[];
  aiSuggestedPrice?: number;
}

// --- Admin: Get all items ---
export const getAllItemsForAdmin = async () => {
  const res = await api.get('/items/allItems');
  return res.data;
};

// --- Create a new item ---
export const createItem = async (data: CreateItemPayload) => {
  const res = await api.post('/items/create', data);
  return res.data;
};

// --- Get all items (with filters) ---
export const getAllItems = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  mode?: string;
}) => {
  const res = await api.get('/items/users-item', { params });
  return res.data;
};

// --- Get single item ---
export const getItemById = async (id: string) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

// --- General update ---
export const updateItem = async (id: string, data: Partial<CreateItemPayload>) => {
  const res = await api.put(`/items/${id}`, data); // matches backend route
  return res.data;
};

// --- Update only status ---
export const updateItemStatus = async (id: string, status: 'available' | 'pending' | 'sold') => {
  const res = await api.put(`/items/updateStatus/${id}`, { status }); // matches backend
  return res.data;
};

// --- Delete item ---
export const deleteItem = async (id: string) => {
  const res = await api.delete(`/items/${id}`);
  return res.data;
};

// --- Get my items ---
export const getMyItems = async () => {
  const res = await api.get('/items/my-items');
  return res.data;
};

// --- Get user-specific items ---
export const getUserItems = async (userId: string) => {
  const res = await api.get(`/items/user/${userId}`);
  return res.data;
};

// --- AI price suggestion ---
export const getAiPriceSuggestion = async (
  title: string,
  category: string,
  condition: string,
  description: string,
  imageUrl?: string
) => {
  const res = await api.post('/items/ai-price', { title, category, condition, description, imageUrl });
  return res.data.price;
};


export const createUserItemReport = async (items: any[]) => {
  try {
    const res = await api.post("/items/createReports", { items }, {
      responseType: "blob", // important for PDF download
    });
    return res.data;
  } catch (err) {
    console.error("Error generating item report:", err);
    throw err;
  }
};



