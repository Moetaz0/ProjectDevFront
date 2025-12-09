// src/App.js
import "./App.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PatientRoute from "./Components/PatientRoute";
import DoctorRoute from "./Components/DoctorRoute";
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
import Settings from "./Components/pages/Settings";
import PrivacyPolicy from "./Components/legal/PrivacyPolicy";
import ContactFormApp from "./Components/Patient/ContactFormApp";
import Step2 from "./Components/auth/Step2";
import Step3 from "./Components/auth/Step3";
import Step4 from "./Components/auth/Step4";
import DoctorDashboard from "./Components/Doctor/Dashboard";

// App.js
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;
  const hideChatbot = location.pathname === "/messages";

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
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/SignUp/Step2" element={<Step2 />} />
        <Route path="/SignUp/Step3" element={<Step3 />} />
        <Route path="/SignUp/Step4" element={<Step4 />} />

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
        <Route
          path="/settings"
          element={
            <PatientRoute>
              <Settings />
            </PatientRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PatientRoute>
              <ContactFormApp />
            </PatientRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        />
      </Routes>

      {!hideChatbot && <Chatbot />}
      <ScrollToTopButton />
    </>
  );
}

export default App;
