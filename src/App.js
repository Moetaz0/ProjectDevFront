// src/App.js
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PatientRoute from "./Components/PatientRoute";

import MapPage from "./Components/pages/MapPage";
import Home from "./Components/pages/Home";
import ContactUs from "./Components/pages/ContactUs";
import AboutUs from "./Components/pages/AboutUs";
import SignUp from "./Components/auth/SignUp";
import SignIn from "./Components/auth/SignIn";
import ForgetPassword from "./Components/auth/forgotPassword";
import LoadingScreen from "./Components/LoadingScreen ";
import ScrollToTopButton from "./Components/ScrollToTopButton ";
import Chatbot from "./Components/Chatbot";
import AppointmentForm from "./Components/AppointmentForm ";
import Prescriptions from "./Components/Patient/Prescriptions";
import MedicalHistory from "./Components/Patient/MedicalHistory";

// App.js
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/appointment" element={<AppointmentForm />} />

        <Route
          path="/prescriptions"
          element={
            <PatientRoute>
              <Prescriptions />
            </PatientRoute>
          }
        />
        <Route
          path="/medical-history"
          element={
            <PatientRoute>
              <MedicalHistory />
            </PatientRoute>
          }
        />
      </Routes>

      <Chatbot />
      <ScrollToTopButton />
    </>
  );
}

export default App;
