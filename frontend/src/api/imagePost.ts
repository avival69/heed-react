import axios from "axios";
import { API_URL } from "./config";

export const createImagePostApi = (data: FormData, token: string) => {
  return axios.post(`${API_URL}/images/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const fetchAllPostsApi = (page = 1, limit = 10) => {
  return axios.get(`${API_URL}/images?page=${page}&limit=${limit}`);
};

// ✅ REMOVED THE DUPLICATE BELOW
export const fetchMyPostsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/images/posts/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; 
  } catch (err) {
    console.error("Fetch My Posts Error:", err);
    throw err;
  }
};

export const toggleLikePostApi = (postId: string, token: string) => {
  return axios.post(
    `${API_URL}/images/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const getSinglePostApi = (postId: string, token?: string) => {
  return axios.get(`${API_URL}/images/${postId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};