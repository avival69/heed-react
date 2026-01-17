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

export const fetchMyPostsApi = async (token: string) => {
  try {
    const res = await axios.get(`${API_URL}/images/posts/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data; // array of posts
  } catch (err) {
    console.error("Fetch My Posts Error:", err);
    throw err;
  }
};

export const fetchAllPostsApi = (token?: string) => {
  return axios.get(`${API_URL}/images`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });
};

export const toggleLikePostApi = (postId: string, token: string) => {
  return axios.post(
    `${API_URL}/images/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// 🔴 BEFORE
// no getSinglePostApi

// ✅ AFTER
export const getSinglePostApi = (postId: string, token?: string) => {
  return axios.get(`${API_URL}/images/${postId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};
