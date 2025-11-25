// src/services/authService.js
import api from "./api";

export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    console.log("Login response:", res.data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Login failed" };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await api.post("/auth/signup", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Registration failed" };
  }
};
