import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Added useLocation
import MapPage from './Components/pages/MapPage';
import Home from './Components/pages/Home';
import ScrollToTopButton from './Components/ScrollToTopButton ';
import Chatbot from './Components/Chatbot';
import LoadingScreen from './Components/LoadingScreen ';
import ContactUs from './Components/pages/ContactUs';
import Settings from "./Components/pages/Settings";
import AboutUs from './Components/pages/AboutUs';
import SignUp from './Components/auth/SignUp';          
import Step2 from './Components/auth/Step2';  
import Step3 from './Components/auth/Step3'; 
import Step4 from './Components/auth/Step4'; 
import SignIn from './Components/auth/SignIn';
import ForgetPassword from './Components/auth/forgotPassword';
import AppointmentForm from './Components/AppointmentForm ';
import Prescriptions from './Components/Patient/Prescriptions';
import MedicalHistory from './Components/Patient/MedicalHistory';
import PrivacyPolicy from "./Components/legal/PrivacyPolicy";
import MessagePage from "./Components/Patient/Messages";
import Dashboard from "./Components/Doctor/Dashboard"; // Import Doctor Dashboard

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // Get current route

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide Chatbot only on /messages page
  const showChatbot = location.pathname !== "/messages";

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        <Route path="/map" element={<MapPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/SignUp" element={<SignUp />} />
         <Route path="/SignUp/Step2" element={<Step2 />} />
          <Route path="/SignUp/Step3" element={<Step3 />} />
           <Route path="/SignUp/Step4" element={<Step4 />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/appointment" element={<AppointmentForm />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/medical-history" element={<MedicalHistory />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {/* Chatbot only appears when NOT on /messages */}
      {showChatbot && <Chatbot />}

      <ScrollToTopButton />
    </>
  );
}

export default App;