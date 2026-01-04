import api from './api';

export interface UpdateProfilePayload {
  fullName?: string;
  location?: string;
  bio?: string;
  // If you add avatar uploading later, you'd pass the ImgBB URL here
  avatarUrl?: string; 
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

//Get Current User Profile 
export const getProfile = async () => {
  const res = await api.get('/auth/me'); // Or '/users/profile' depending on your backend
  return res.data;
};

//Update Personal Information
export const updateProfile = async (data: UpdateProfilePayload) => {
  const res = await api.put('/auth/updatedetails', data); 
  return res.data;
};

//Change Password
export const changePassword = async (data: ChangePasswordPayload) => {
  const res = await api.put('/auth/updatepassword', data);
  return res.data;
};

// Delete Account (Danger Zone)
export const deleteAccount = async () => {
  const res = await api.delete('/auth/delete');
  return res.data;
};