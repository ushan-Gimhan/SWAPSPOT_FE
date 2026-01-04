import api from './api';

// Interface for the data you send when updating a profile
export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  avatar?: string; // For avatar URL if you add image uploading later
}

// Get the current logged-in user's profile
export const getUserProfile = async () => {
  // Matches the backend route: GET /api/v1/profile
  const res = await api.get('/profile');
  return res.data;
};

// Update user profile details
export const updateUserProfile = async (data: UpdateProfilePayload) => {
  // Matches the backend route: PUT /api/v1/profile
  const res = await api.put('/profileUpdate', data);
  return res.data;
};

// Delete the user's account
export const deleteAccount = async () => {
  // Matches the backend route: DELETE /api/v1/profile
  const res = await api.delete('/profileDelete');
  return res.data;
};

export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.put('/profile/change-password', { currentPassword, newPassword });
  return res.data;
}