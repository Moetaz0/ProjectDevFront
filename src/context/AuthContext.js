// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevent flash of unauthenticated state

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Loaded token:", token);
        const savedUser = localStorage.getItem("user");

        if (token && savedUser && savedUser !== "undefined") {
          const parsedUser = JSON.parse(savedUser);
          // Ensure username is populated even if old sessions lacked it
          if (!parsedUser.username && parsedUser.email) {
            parsedUser.username = parsedUser.email.split("@")[0];
          }
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Failed to load user from storage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const token = response.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Decode token to get real user data
      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.error("Invalid token format");
        throw new Error("Invalid login session");
      }

      // Build clean user object
      console.log("Decoded token:", decoded);
      const emailFromToken = decoded.email || decoded.sub || response.email;
      const userData = {
        username:
          decoded.username ||
          decoded.name ||
          emailFromToken?.split("@")[0] ||
          "User",
        email: emailFromToken,
        userId: decoded.userId || decoded.id || decoded.sub,
        role: decoded.role || response.role || "patient",
        // Add any other fields you need
      };

      // Save to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
      localStorage.setItem("username", userData.username);

      // Update state
      setUser(userData);

      console.log(
        "Logged in as:",
        userData.username,
        `(Role: ${userData.role})`
      );
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      logout(); // Clean up on failure
      throw error;
    }
  };

  const register = async (username, email, password, phoneNumber) => {
    try {
      const response = await registerUser({
        username,
        email,
        password,
        phoneNumber: "", // optional
      });
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    // Optional: redirect
    // window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
