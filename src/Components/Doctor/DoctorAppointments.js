// DoctorAppointments.jsx — Clean & Professional Version (no money)
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  BellRing,
  UserCheck,
  Loader,
  X,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/api";
import { getUserFromToken } from "../../utils/jwt";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [todayStats, setTodayStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    reminders: 0,
  });

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = getUserFromToken();
        if (user?.userId) {
          const data = await getDoctorAppointments(user.userId);
          console.log("Fetched appointments:", data);

          // Transform API data to match component structure
          const transformedData = Array.isArray(data)
            ? data.map((appt) => {
                // Convert date string to day of week
                const appointmentDate = new Date(appt.date);
                const dayIndex = appointmentDate.getDay();
                const dayNames = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                const day = dayNames[dayIndex];

                // Format time (convert 12:09:00 to 12:09 PM format)
                const timeStr = appt.time || "12:00:00";
                const [hoursStr, minutesStr] = timeStr.split(":");
                const hour = parseInt(hoursStr);
                const minutes = minutesStr || "00";
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour =
                  hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                const formattedTime = `${String(displayHour).padStart(
                  2,
                  "0"
                )}:${minutes} ${ampm}`;

                console.log(
                  `Appointment: ${appt.date} ${appt.time} -> ${day} ${formattedTime}`
                );

                return {
                  ...appt,
                  day,
                  time: formattedTime,
                  patient: appt.patientName || "Patient",
                  reason: appt.notes || appt.reason || "Appointment",
                  age: appt.age || 0,
                  reminder: appt.reminder === true,
                  status:
                    appt.status?.toLowerCase() === "confirmed"
                      ? "confirmed"
                      : "pending",
                };
              })
            : data.appointments || [];

          setAppointments(transformedData);
          console.log("Transformed appointments:", transformedData);

          // Calculate stats
          const total = transformedData.length;
          const confirmed = transformedData.filter(
            (a) => a.status === "confirmed"
          ).length;
          const pending = transformedData.filter(
            (a) => a.status === "pending"
          ).length;
          const reminders = transformedData.filter(
            (a) => a.reminder === true
          ).length;

          setTodayStats({
            total,
            confirmed,
            pending,
            reminders,
          });
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getAppointmentsForSlot = (day, time) => {
    // Match appointments for the given day and time slot
    const matched = appointments.filter((a) => {
      if (a.day !== day) return false;

      // Try exact match first
      if (a.time === time) return true;

      // Match by hour and AM/PM (e.g., 12:09 PM matches 12:00 PM slot)
      const slotParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      const apptParts = a.time.match(/(\d+):(\d+)\s*(AM|PM)/i);

      if (slotParts && apptParts) {
        const slotHour = slotParts[1];
        const slotPeriod = slotParts[3];
        const apptHour = apptParts[1];
        const apptPeriod = apptParts[3];

        return slotHour === apptHour && slotPeriod === apptPeriod;
      }

      return false;
    });
    console.log(`Matching appointments for ${day} ${time}:`, matched);
    return matched;
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedAppointment) return;

    setUpdating(true);
    setErrorMsg("");

    try {
      await updateAppointmentStatus(selectedAppointment.id, newStatus);

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === selectedAppointment.id
            ? { ...appt, status: newStatus.toLowerCase() }
            : appt
        )
      );

      // Recalculate stats
      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointment.id
          ? { ...appt, status: newStatus.toLowerCase() }
          : appt
      );

      const confirmed = updatedAppointments.filter(
        (a) => a.status === "confirmed"
      ).length;
      const pending = updatedAppointments.filter(
        (a) => a.status === "pending"
      ).length;

      setTodayStats((prev) => ({
        ...prev,
        confirmed,
        pending,
      }));

      setSuccessMsg(`Appointment marked as ${newStatus.toLowerCase()}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setErrorMsg("Failed to update appointment status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* TOASTS */}
      {successMsg && <SuccessToast message={successMsg} />}
      {errorMsg && <ErrorToast message={errorMsg} />}

      {/* MODAL FOR APPOINTMENT DETAILS */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Appointment Details</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Patient</p>
                <p className="text-lg font-semibold">
                  {selectedAppointment.patient}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date & Time</p>
                <p className="text-lg">
                  {selectedAppointment.day} • {selectedAppointment.time}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Reason</p>
                <p className="text-lg">{selectedAppointment.reason}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Status</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedAppointment.status === "confirmed"
                      ? "bg-green-500/30 text-green-200"
                      : "bg-yellow-500/30 text-yellow-200"
                  }`}
                >
                  {selectedAppointment.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-400 text-sm font-medium">
                Change Status:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStatusChange("CONFIRMED")}
                  disabled={
                    updating || selectedAppointment.status === "confirmed"
                  }
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-semibold ${
                    selectedAppointment.status === "confirmed"
                      ? "bg-green-500/20 border-green-400/50 text-green-300 cursor-not-allowed"
                      : "bg-green-500/10 border-green-400/30 hover:bg-green-500/20 hover:border-green-400/50"
                  }`}
                >
                  <Check size={20} />
                  {updating ? "Updating..." : "Confirmed"}
                </button>
                <button
                  onClick={() => handleStatusChange("PENDING")}
                  disabled={
                    updating || selectedAppointment.status === "pending"
                  }
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-semibold ${
                    selectedAppointment.status === "pending"
                      ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-300 cursor-not-allowed"
                      : "bg-yellow-500/10 border-yellow-400/30 hover:bg-yellow-500/20 hover:border-yellow-400/50"
                  }`}
                >
                  <XCircle size={20} />
                  {updating ? "Updating..." : "Pending"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
              My Appointments
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={28} className="text-[#67e8f9]" />
            <span className="text-lg">December 2025</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin" size={48} />
        </div>
      ) : (
        <>
          {/* STATS CARDS — No money, now with Reminders */}
          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total Today</p>
                  <p className="text-4xl font-bold mt-2">{todayStats.total}</p>
                </div>
                <Users size={40} className="text-[#4addbf] opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Confirmed</p>
                  <p className="text-4xl font-bold mt-2 text-green-400">
                    {todayStats.confirmed}
                  </p>
                </div>
                <CheckCircle size={40} className="text-green-400 opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Pending</p>
                  <p className="text-4xl font-bold mt-2 text-yellow-400">
                    {todayStats.pending}
                  </p>
                </div>
                <AlertCircle size={40} className="text-yellow-400 opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Reminders Today</p>
                  <p className="text-4xl font-bold mt-2 text-purple-400">
                    {todayStats.reminders}
                  </p>
                </div>
                <BellRing size={40} className="text-purple-400 opacity-80" />
              </div>
            </motion.div>
          </div>

          {/* WEEKLY SCHEDULE — unchanged beauty */}
          <div className="px-8 pb-10 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-8 border-b border-white/10">
                <div className="p-6 text-gray-400 font-medium">Time</div>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-6 text-center font-semibold text-lg"
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {timeSlots.map((time, idx) => (
                <div
                  key={time}
                  className={`grid grid-cols-8 ${
                    idx !== timeSlots.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <div className="p-6 text-gray-300 font-medium flex items-center">
                    <Clock size={18} className="mr-2 text-[#67e8f9]" />
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const slotAppointments = getAppointmentsForSlot(day, time);
                    return (
                      <div
                        key={day}
                        className="p-4 min-h-32 border-l border-white/5 hover:bg-white/5 transition-all"
                      >
                        {slotAppointments.map((appt, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleAppointmentClick(appt)}
                            className={`p-4 rounded-2xl mb-2 text-sm border cursor-pointer hover:scale-105 transition-all ${
                              appt.status === "confirmed"
                                ? "bg-green-500/20 border-green-400/50 hover:bg-green-500/30"
                                : "bg-yellow-500/20 border-yellow-400/50 hover:bg-yellow-500/30"
                            }`}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              <UserCheck size={16} />
                              {appt.patient}
                              {appt.reminder && (
                                <BellRing
                                  size={14}
                                  className="text-purple-400 ml-auto"
                                  title="Reminder needed"
                                />
                              )}
                            </div>
                            <p className="text-xs opacity-80 mt-1">
                              {appt.reason} • {appt.age} years
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                appt.status === "confirmed"
                                  ? "text-green-300"
                                  : "text-yellow-300"
                              }`}
                            >
                              {appt.status === "confirmed"
                                ? "confirmed"
                                : "Reminder Pending"}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>

            {/* DEBUG: Show all appointments if any don't appear in calendar */}
            {appointments.length > 0 && (
              <div className="mt-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6">
                <h3 className="text-xl font-bold mb-4">
                  All Appointments ({appointments.length})
                </h3>
                <div className="space-y-4">
                  {appointments
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((appt, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAppointmentClick(appt)}
                        className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all ${
                          appt.status === "confirmed"
                            ? "bg-green-500/20 border-green-400/50 hover:bg-green-500/30"
                            : "bg-yellow-500/20 border-yellow-400/50 hover:bg-yellow-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{appt.patient}</p>
                            <p className="text-sm text-gray-300">
                              {appt.day} • {appt.time}
                            </p>
                            <p className="text-sm opacity-80">{appt.reason}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              appt.status === "confirmed"
                                ? "bg-green-500/30 text-green-200"
                                : "bg-yellow-500/30 text-yellow-200"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {appointments.length > itemsPerPage && (
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="text-sm text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        appointments.length
                      )}{" "}
                      of {appointments.length} appointments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          {
                            length: Math.ceil(
                              appointments.length / itemsPerPage
                            ),
                          },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-xl transition-all ${
                              currentPage === page
                                ? "bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-semibold"
                                : "bg-white/10 border border-white/20 hover:bg-white/20"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(appointments.length / itemsPerPage)
                            )
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(appointments.length / itemsPerPage)
                        }
                        className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorAppointments;
