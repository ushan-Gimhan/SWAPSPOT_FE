import axios from 'axios';

const IMGBB_API_KEY = '7af639ef7e84896280dcdf0ae32509f6'; // Replace with your actual key

export const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    return response.data.data.url; // Returns the public display URL
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw new Error("Failed to upload image");
  }
};