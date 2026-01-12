import axios from "axios";
import { API_URL } from "./config";

export const signupApi = async (payload: any) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  }catch (err: any) {
  throw err;
}

};

export const loginApi = async (payload: any) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err: any) {
  throw err;
}

};
