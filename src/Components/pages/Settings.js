import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import { User, Mail, Phone, Globe, Shield, Save } from "lucide-react";
import { getUserFromToken } from "../../utils/jwt";
import api from "../../services/api";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fake loading for beauty
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const [userData, setUserData] = useState({
    id: "",
    username: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const userid = getUserFromToken().userId;
    console.log("User ID from token:", userid);
    if (userid) {
      // Fetch user data from backend using userid
      api
        .get(`/users/${userid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        .then((response) => {
          const data = response.data;
          console.log("Fetched user data:", data);
          setUserData({
            id: data.id || "",
            username: data.username || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            role: data.role || "",
          });
        });
    }

    setLoading(false);
  }, []);
  // ======== Save profile changes ========
  const handleSave = async () => {
    try {
      await api.put(`/users/${userData.id}`, userData);

      setSuccessMessage("Profile updated successfully!");
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage("Failed to update profile. Please try again.");
      setShowError(true);
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <SuccessToast
        message={successMessage}
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorToast
        message={errorMessage}
        show={showError}
        onClose={() => setShowError(false)}
      />

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white pt-24 pb-16 px-6 md:px-12 lg:px-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#67e8f9] to-[#4addbf] drop-shadow-lg">
            Patient Settings
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            Personalize your MedLink experience
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* === PROFILE CARD === */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#4addbf]/20 to-transparent p-1">
                <div className="bg-[#0f172a]/90 h-full rounded-3xl p-8">
                  {/* Title */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-[#4addbf]/20 rounded-2xl">
                      <User className="w-8 h-8 text-[#4addbf]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#67e8f9]">
                      Profile Information
                    </h2>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium">
                        Full Name{" "}
                        {userData.username === "" && (
                          <span className="text-red-400">(Required)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={userData.username}
                        onChange={(e) =>
                          setUserData({ ...userData, fullName: e.target.value })
                        }
                        placeholder="Enter your full name"
                        className="mt-2 w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/50 transition-all text-lg"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="mt-2 w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/50 transition-all text-lg"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone Number
                      </label>
                      <input
                        type="text"
                        value={userData.phoneNumber}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="+123 456 7890"
                        className="mt-2 w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/50 transition-all text-lg"
                      />
                    </div>

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="w-full mt-8 py-5 bg-gradient-to-r from-[#4addbf] to-[#39c6a5] text-[#0f172a] font-bold text-xl rounded-2xl shadow-xl hover:shadow-[#4addbf]/50 transition-all flex items-center justify-center gap-3"
                    >
                      <Save className="w-6 h-6" />
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* === RIGHT COLUMN === */}
            <div className="space-y-10">
              {/* Language */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8 }}
                className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-[#4addbf]/20 rounded-2xl">
                    <Globe className="w-8 h-8 text-[#4addbf]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#67e8f9]">
                    Language
                  </h2>
                </div>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-lg
                  focus:outline-none focus:ring-4 focus:ring-[#4addbf]/50 transition-all"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 py-4 bg-[#4addbf] text-[#0f172a] font-bold rounded-2xl hover:bg-[#39c6a5] transition-all shadow-lg"
                >
                  Update Language
                </motion.button>
              </motion.div>

              {/* Privacy */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8 }}
                className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-[#4addbf]/20 rounded-2xl">
                    <Shield className="w-8 h-8 text-[#4addbf]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#67e8f9]">
                    Privacy & Security
                  </h2>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Your health data is encrypted and protected. We never share it
                  without your consent.
                </p>

                <a
                  href="/privacy-policy"
                  className="inline-flex items-center gap-3 text-[#4addbf] font-bold text-lg hover:text-[#67e8f9] transition-all group"
                >
                  View Privacy Policy →
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
