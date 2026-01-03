import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/items/post"; 

export const createItem = async (formData: FormData) => {
  const token = localStorage.getItem("accessToken");

  // Safety Check: Don't even try the request if no token exists
  if (!token) {
    throw new Error("You must be logged in to post an item.");
  }

  return await axios.post(API_URL, formData, {
    headers: {
      // ✅ REMOVED 'Content-Type'. Let Axios/Browser set it automatically with the boundary.
      Authorization: `Bearer ${token}`,
    },
  });
};