import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import logo from "../../static/logo.png";

const Settings = () => {
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  // Fake loading screen
  setTimeout(() => setLoading(false), 800);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center">
        <motion.img
          src={logo}
          alt="Loading"
          className="w-28 h-28 mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <p className="text-[#4addbf] font-semibold text-xl tracking-wider">
          Loading Settings...
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* MAIN PAGE */}
      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white px-6 md:px-20 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-[#4addbf] drop-shadow-[0_0_10px_#4addbf] mb-12">
          Patient Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* PROFILE SETTINGS */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0F172A]/70 p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_#4addbf30]"
          >
            <h2 className="text-2xl font-semibold text-[#67e8f9] mb-4">Profile</h2>

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 mb-4 bg-[#0F172A] border border-white/20 text-white rounded-xl"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 mb-4 bg-[#0F172A] border border-white/20 text-white rounded-xl"
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-3 mb-4 bg-[#0F172A] border border-white/20 text-white rounded-xl"
            />

            <button className="bg-[#4addbf] text-[#0F172A] px-6 py-3 font-semibold rounded-xl shadow-[0_0_20px_#4addbf50] hover:bg-[#39c6a5] transition">
              Save Changes
            </button>
          </motion.div>

          {/* LANGUAGE SETTINGS */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0F172A]/70 p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_#4addbf30]"
          >
            <h2 className="text-2xl font-semibold text-[#67e8f9] mb-4">Language</h2>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 bg-[#0F172A] border border-white/20 text-white rounded-xl"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">عربي</option>
            </select>

            <button className="mt-4 bg-[#4addbf] text-[#0F172A] px-6 py-3 font-semibold rounded-xl hover:bg-[#39c6a5] transition">
              Update Language
            </button>
          </motion.div>

          {/* PRIVACY POLICY LINK */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0F172A]/70 p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_#4addbf30]"
          >
            <h2 className="text-2xl font-semibold text-[#67e8f9] mb-3">Privacy Policy</h2>

            <p className="text-gray-300 mb-4">
              Learn how MedLink collects and protects your data.
            </p>

            <a
              href="/privacy-policy"
              className="text-[#4addbf] font-semibold underline hover:text-[#39c6a5] transition-all"
            >
              View Full Privacy Policy →
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Settings;
