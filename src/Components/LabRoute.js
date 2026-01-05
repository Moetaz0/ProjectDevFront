// src/components/LabRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LabRoute = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <Navigate to="/SignIn" />; // not logged in
  if (user.role !== "Labs") {
    logout();
    return <Navigate to="/" />; // logged in but not lab
  }

  return children;
};

export default LabRoute;
