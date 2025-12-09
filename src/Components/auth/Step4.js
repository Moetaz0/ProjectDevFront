// src/Components/auth/Step4.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import login from "../../static/Signup.png";
import * as authService from "../../services/authService";
import api from "../../services/api";
const Step4 = () => {
  const navigate = useNavigate();

  const handleFinalSubmit = async () => {
    try {
      // 1️⃣ Get data from previous steps
      const step1Data = JSON.parse(localStorage.getItem("step1Data") || "{}");
      const step2Data = JSON.parse(localStorage.getItem("step2Data") || "{}");
      const step3Data = JSON.parse(localStorage.getItem("step3Data") || "{}");

      // 2️⃣ Prepare registration payload
      const payload = {
        username: step1Data.username?.trim(), // remove extra spaces
        email: step1Data.email,
        password: step1Data.password,
        phoneNumber: step1Data.phoneNumber,
      };

      // 3️⃣ Register user
      const registerRes = await authService.registerUser(payload);
      console.log("Register response:", registerRes);

      if (!registerRes?.token) {
        console.error("Registration failed: No token returned");
        return;
      }

      // 4️⃣ Store token and userId
      const token = registerRes.token.trim(); // trim just in case
      const userId = registerRes.userId;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      // 5️⃣ Prepare medical history payload
      const medicalHistory = {
        ...(step1Data.date_of_birth && {
          date_of_birth: step1Data.date_of_birth,
        }),
        ...(step1Data.gender && { gender: step1Data.gender }),
        ...(step1Data.heightCm && { heightCm: step1Data.heightCm }),
        ...(step1Data.weightKg && { weightKg: step1Data.weightKg }),
        ...step2Data,
        ...step3Data,
        userId,
      };

      // 6️⃣ Save medical history
      const res = await fetch(
        `http://localhost:8000/api/medical-history/save/${medicalHistory.userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medicalHistory),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to save medical history: ${res.status} - ${errorText}`
        );
      }

      console.log("Medical history saved successfully");

      // 7️⃣ Cleanup localStorage
      localStorage.removeItem("step1Data");
      localStorage.removeItem("step2Data");
      localStorage.removeItem("step3Data");

      // 8️⃣ Navigate to login/dashboard
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Error during final submission:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#0F172A] to-[#16223A] relative overflow-hidden">
      <div className="w-1/2 flex items-center justify-center z-10">
        <div className="w-[90%] max-h-[95vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-[#4addbf50] rounded-3xl p-10 shadow-[0_0_30px_#4addbf70] text-white text-center">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate("/SignUp/Step3")}
              className="text-4xl hover:text-[#4addbf] transition"
            >
              <FiChevronLeft />
            </button>
            <p className="text-white/70 text-sm">Step 4 of 4</p>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-10">
            <div className="bg-[#4addbf] h-2 rounded-full w-full transition-all duration-700"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <FiCheckCircle
              size={120}
              className="mx-auto text-[#4addbf] drop-shadow-lg"
            />
            <h1 className="text-6xl font-bold">Welcome to Medlink!</h1>
            <p className="text-xl text-white/80">
              Your profile is complete. Let's take care of your health.
            </p>

            <div className="pt-10">
              <button
                onClick={handleFinalSubmit} // Change to your dashboard route
                className="px-16 py-5 rounded-2xl font-bold text-xl bg-[#4addbf] hover:bg-[#39c6a5] text-black transition-all shadow-[0_0_50px_#4addbf70]"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative w-1/2 h-screen overflow-hidden">
        <motion.img
          src={login}
          alt="Medical"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
      </div>
    </div>
  );
};

export default Step4;
