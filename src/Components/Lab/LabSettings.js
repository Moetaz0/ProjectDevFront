// LabSettings.jsx — EXACT same design as your DoctorSettings
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getAllLabs, updateUser, updateLab } from "../../services/api";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";
import {
  ArrowLeft,
  Building2,
  Shield,
  Bell,
  Lock,
  Save,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const LabSettings = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingLab, setSavingLab] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
  });

  // Fetch lab data on component mount
  useEffect(() => {
    const fetchLabData = async () => {
      if (!user?.userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all labs
        const allLabs = await getAllLabs();

        // Find the lab where lab.user.id matches token userId
        const matchedLab = allLabs.find((lab) => lab?.user?.id === user.userId);

        if (!matchedLab) {
          setError("Lab not found for this user");
          setLoading(false);
          return;
        }

        setLabData(matchedLab);

        // Populate form with fetched lab data
        setFormData({
          name: matchedLab?.name || matchedLab?.user?.username || "",
          specialty: matchedLab?.specialty || "",
          email: matchedLab?.user?.email || "",
          phone: matchedLab?.user?.phoneNumber || matchedLab?.phoneNumber || "",
          address: matchedLab?.address || "",
          currentPassword: "",
          newPassword: "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching lab data:", err);
        setError("Failed to load lab information");
        setLoading(false);
      }
    };

    fetchLabData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveLabInfo = async () => {
    if (!user?.userId || !labData?.id) {
      setError("User or lab data not available");
      console.log("id , userId", labData?.id, user?.userId);
      return;
    }
    setSavingLab(true);
    try {
      // Update lab information
      const labPayload = {
        name: formData.name,
        specialty: formData.specialty,
        address: formData.address,
      };
      const updatedLab = await updateLab(labData.id, labPayload);
      setLabData(updatedLab);

      setSuccessMsg("Lab information updated successfully!");
    } catch (err) {
      console.error("Error saving lab data:", err);
      setErrorMsg("Failed to save lab information. Please try again.");
    } finally {
      setSavingLab(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!user?.userId) {
      setError("User not logged in");
      return;
    }

    setSavingGeneral(true);
    try {
      const userPayload = {
        email: formData.email,
        phoneNumber: formData.phone,
      };

      await updateUser(user.userId, userPayload);

      setSuccessMsg("General information updated successfully!");
    } catch (err) {
      console.error("Error saving general info:", err);
      setErrorMsg("Failed to save general information. Please try again.");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!user?.userId) {
      setError("User not logged in");
      return;
    }

    if (!formData.newPassword || formData.newPassword.trim() === "") {
      setErrorMsg("Please enter a new password before saving.");
      return;
    }

    setSavingSecurity(true);
    try {
      const userPayload = {
        password: formData.newPassword,
      };

      await updateUser(user.userId, userPayload);

      // Clear password fields after successful save
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      setSuccessMsg("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      setErrorMsg("Failed to update password. Please try again.");
    } finally {
      setSavingSecurity(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4addbf] mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading lab information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-white text-lg">{error}</p>
          <button
            onClick={() => navigate("/Lab-Dashboard")}
            className="mt-6 px-6 py-3 bg-[#4addbf] text-black font-bold rounded-xl hover:bg-[#67e8f9] transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/Lab-Dashboard")}
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
          <h2 className="text-5xl font-bold mb-3">Lab Settings</h2>
          <p className="text-gray-300 text-lg">
            Manage your laboratory profile, security, and notification
            preferences
          </p>
        </motion.div>

        {/* LAB INFORMATION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Building2 size={34} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Laboratory Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Building2 size={18} /> Lab Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Building2 size={18} /> Specialty
              </label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <MapPin size={18} /> Address
              </label>
              <textarea
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveLabInfo}
              disabled={savingLab}
              className="px-8 py-4 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={22} />
              {savingLab ? "Saving..." : "Save Lab Info"}
            </button>
          </div>
        </motion.section>

        {/* GENERAL */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Bell size={34} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">General Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Mail size={18} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveGeneral}
              disabled={savingGeneral}
              className="px-8 py-4 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={22} />
              {savingGeneral ? "Saving..." : "Save General"}
            </button>
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
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
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
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveSecurity}
              disabled={savingSecurity}
              className="px-8 py-4 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Lock size={22} />
              {savingSecurity ? "Saving..." : "Save Security"}
            </button>
          </div>
        </motion.section>
      </div>

      {successMsg && (
        <SuccessToast
          message={successMsg}
          show={!!successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
      {errorMsg && (
        <ErrorToast
          message={errorMsg}
          show={!!errorMsg}
          onClose={() => setErrorMsg("")}
        />
      )}
    </div>
  );
};

export default LabSettings;
