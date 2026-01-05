// DoctorSettings.jsx — Fully redesigned to match your Messages style
import React, { useState, useEffect } from "react";
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
  Loader,
  Clipboard,
  MapPinHouse,
} from "lucide-react";
import { getDoctorById, updateDoctor } from "../../services/api";
import { getUserFromToken } from "../../utils/jwt";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";

const DoctorSettings = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    qualifications: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch doctor info on component mount
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const user = getUserFromToken();
        if (user?.userId) {
          const data = await getDoctorById(user.userId);
          console.log("Fetched doctor data:", data);

          setDoctorData({
            doctorname: data.user.username || "",
            email: data.user.email || "",
            phone: data.user.phoneNumber || "N/A",
            specialty: data.specialization || "",
            bio: data.bio || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        setErrorMsg("Failed to load doctor information");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const user = getUserFromToken();
      if (!user?.userId) {
        setErrorMsg("User not authenticated");
        setSaving(false);
        return;
      }

      await updateDoctor(user.userId, doctorData);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating doctor:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* TOASTS */}
      {successMsg && <SuccessToast message={successMsg} />}
      {errorMsg && <ErrorToast message={errorMsg} />}

      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/doctor/dashboard")}
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

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin" size={48} />
        </div>
      ) : (
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

          <form onSubmit={handleSaveChanges} className="space-y-12">
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
                    <User size={18} /> Doctor Name
                  </label>
                  <input
                    type="text"
                    name="doctorname"
                    value={doctorData.doctorname}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <Stethoscope size={18} /> Specialty
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={doctorData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <Clipboard size={18} /> Bio
                  </label>
                  <input
                    type="text"
                    name="bio"
                    value={doctorData.bio}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <Mail size={18} /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={doctorData.email}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <Phone size={18} /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={doctorData.phone}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3 mt-8">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <MapPinHouse size={18} /> Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={doctorData.address}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all resize-none"
                ></textarea>
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
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-7 h-7 accent-[#4addbf] rounded-lg"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-lg">Appointment Reminders</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-7 h-7 accent-[#4addbf] rounded-lg"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-lg">New Patient Alerts</span>
                  <input
                    type="checkbox"
                    className="w-7 h-7 accent-[#4addbf] rounded-lg"
                  />
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
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-5 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader size={26} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={26} />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorSettings;
