import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded JWT:", decoded);
    return {
      username: decoded.sub || null,
      role: decoded.role || null,
      email: decoded.email || decoded.sub || null,
      userId: decoded.userId || decoded.id || decoded.sub || null,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
