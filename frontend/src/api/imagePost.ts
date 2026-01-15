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
