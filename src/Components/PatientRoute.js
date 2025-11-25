// src/components/PatientRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PatientRoute = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <Navigate to="/SignIn" />; // not logged in
  if (user.role !== "CLIENT") {
    logout();
    return <Navigate to="/" />; // logged in but not patient
  }

  return children;
};

export default PatientRoute;
