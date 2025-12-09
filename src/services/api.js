import axios from "axios";
import { getUserFromToken } from "../utils/jwt";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Fetch all doctors
export const getAllDoctors = async () => {
  try {
    const response = await api.get("/api/doctors");
    console.log("All doctors:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};
// services/api.js

export const getUserById = async (id) => {
  try {
    const id = getUserFromToken()?.userId;
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default api;
