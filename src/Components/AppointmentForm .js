import React, { useState, useEffect } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const AppointmentForm = ({ onClose }) => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/doctors");
      setDoctors(res.data);
      console.log("Fetched doctors:", res.data);
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return (window.location.href = "/signin");
    console.log("Booking appointment for user:", user);
    console.log("Form data:", formData);
    const payload = {
      clientId: user.userId,
      doctorId: formData.doctorId,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      status: "PENDING",
    };
    console.log("Appointment payload:", payload);

    try {
      const token = localStorage.getItem("token");
      await api.post("/appointments/book", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Appointment created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center 
        bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 130 }}
          className=" bg-[#0F172A] p-8 w-[420px] rounded-2xl shadow-lg relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-xl hover:text-red-500 transition"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Book Appointment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white font-semibold mb-2">
                Select Doctor
              </label>

              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={(e) =>
                  setFormData({ ...formData, doctorId: e.target.value })
                }
                required
                className="w-full p-3 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-[#4addbf] focus:outline-none text-black"
              >
                <option value="">Choose a doctor</option>

                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.user.username} — {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-gray-300 
                focus:ring-2 focus:ring-[#4addbf] text-black"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-gray-300 text-black
                focus:ring-2 focus:ring-[#4addbf]"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-gray-300 text-black
                focus:ring-2 focus:ring-[#4addbf]"
              ></textarea>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-6 rounded-lg bg-red-500 text-white 
                hover:bg-red-600 transition"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="py-2 px-6 rounded-lg bg-[#4addbf] text-gray-900 
                font-semibold hover:bg-[#39c6a5] transition shadow-md"
              >
                Confirm
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentForm;
