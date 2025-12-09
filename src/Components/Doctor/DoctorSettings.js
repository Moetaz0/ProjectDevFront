// DoctorSettings.jsx — Fully redesigned to match your Messages style
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Save,
  Mail,
  Phone,
  Stethoscope,
  Shield,
} from "lucide-react";

const DoctorSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/doctor-dashboard")}
              className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto space-y-12 mt-8">

        {/* PAGE TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-3">Account Settings</h2>
          <p className="text-gray-300 text-lg">
            Manage your profile, security, and preferences
          </p>
        </motion.div>

        {/* PROFILE INFORMATION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <User size={34} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Profile Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <User size={18} /> Full Name
              </label>
              <input
                type="text"
                defaultValue="Dr. Henry"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Stethoscope size={18} /> Specialty
              </label>
              <input
                type="text"
                defaultValue="MBBS • FCPS • MD(Medicine)"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Mail size={18} /> Email Address
              </label>
              <input
                type="email"
                defaultValue="henry@example.com"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Phone size={18} /> Phone Number
              </label>
              <input
                type="text"
                defaultValue="+216 21 345 678"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* SECURITY */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Lock size={34} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Security</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Shield size={18} /> Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Shield size={18} /> New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* NOTIFICATIONS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Bell size={34} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Notifications</h3>
          </div>

          <div className="space-y-8">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-lg">Email Notifications</span>
              <input type="checkbox" defaultChecked className="w-7 h-7 accent-[#4addbf] rounded-lg" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-lg">Appointment Reminders</span>
              <input type="checkbox" defaultChecked className="w-7 h-7 accent-[#4addbf] rounded-lg" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-lg">New Patient Alerts</span>
              <input type="checkbox" className="w-7 h-7 accent-[#4addbf] rounded-lg" />
            </label>
          </div>
        </motion.section>

        {/* SAVE BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <button className="px-10 py-5 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
            <Save size={26} />
            Save Changes
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorSettings;