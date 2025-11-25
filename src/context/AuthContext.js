// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from storage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    try {
      if (savedUser && savedUser !== "undefined") {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      localStorage.removeItem("user");
    }
  }, []);
  const login = async (credentials) => {
    const data = await loginUser(credentials);

    // data has email, role, token
    const { token, ...userData } = data;

    setUser(userData); // store user without token
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    return userData;
  };
  const register = async (username, email, password) => {
    const response = await registerUser({
      username,
      email,
      password,
      phoneNumber: "", // optional field, backend ignores it
    });

    return response;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
