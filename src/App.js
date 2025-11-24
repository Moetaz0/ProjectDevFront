import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MapPage from './Components/pages/MapPage'; // Import the map component (fixed the path)
import Home from './Components/pages/Home'; // Import the Home component
import ScrollToTopButton from './Components/ScrollToTopButton '; // Import the scroll to top button component
import Chatbot from './Components/Chatbot'; // Import the chatbot component
import LoadingScreen from './Components/LoadingScreen '; // Import the loading screen component
import ContactUs from './Components/pages/ContactUs'; // Import the ContactUs component
import AboutUs from './Components/pages/AboutUs';
import SignUp from './Components/auth/SignUp';
import SignIn from './Components/auth/SignIn';
import ForgetPassword from './Components/auth/forgotPassword';
import AppointmentForm from './Components/AppointmentForm ';
import Prescriptions from './Components/Patient/Prescriptions';
import MedicalHistory from './Components/Patient/MedicalHistory';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/appointment" element={<AppointmentForm />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/medical-history" element={<MedicalHistory />} />




          {/* Add other routes here */}
        </Routes>
        <Chatbot />
        <ScrollToTopButton />
    </>
  );
}

export default App;
