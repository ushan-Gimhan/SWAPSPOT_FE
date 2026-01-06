import api from './api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (
  fullName: string,
  email: string,
  password: string,
  role: string
) => {
  const res = await api.post('/auth/register', {
    fullName,
    email,
    password,
    role,
  });
  return res.data;
};

export const getMyDetails = async () => {
  const res = await api.get('/auth/me');
  return res.data.data;
};

export const registerAdmin = async (data: {
  fullName: string;
  email: string;
  password: string;
  role : string
}) => {
  const res = await api.post('/auth/admin/register', data);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

// export const approveAuthor = async (id: string) => {
//   const res = await api.put(/users/${id}/approve);
//   return res.data;
// };

export const refreshTokens = async (refreshToken: string) => {
  const res = await api.post('/auth/refresh', { token: refreshToken })
  return res.data
}

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export const updateUserStatus = async (id: string, status: string) => {
  const res = await api.put(`/users/${id}/status`, { status });
  return res.data;
}