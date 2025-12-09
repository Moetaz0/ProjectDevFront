// DoctorAppointments.jsx — Clean & Professional Version (no money)
import React from "react";
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
} from "lucide-react";

const DoctorAppointments = () => {
  const navigate = useNavigate();

  // Updated stats — no money
  const todayStats = {
    total: 18,
    completed: 11,
    pending: 7,
    reminders: 5, // patients who need reminder calls/SMS today
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  const appointments = [
    { day: "Monday", time: "09:00 AM", patient: "Sarah Ali", status: "completed", age: 28, reason: "Follow-up", reminder: false },
    { day: "Monday", time: "11:00 AM", patient: "Ahmed Ben Salem", status: "completed", age: 45, reason: "Blood Pressure Check", reminder: false },
    { day: "Monday", time: "03:00 PM", patient: "Nour Jlassi", status: "pending", age: 19, reason: "General Consultation", reminder: true },
    { day: "Tuesday", time: "10:00 AM", patient: "Mohamed Trabelsi", status: "pending", age: 34, reason: "Vaccination", reminder: true },
    { day: "Tuesday", time: "04:00 PM", patient: "Amina Khelifi", status: "completed", age: 52, reason: "Diabetes Check", reminder: false },
    { day: "Wednesday", time: "02:00 PM", patient: "Yassine Mansour", status: "pending", age: 31, reason: "Back Pain", reminder: true },
    { day: "Thursday", time: "05:00 PM", patient: "Lina Ferjani", status: "completed", age: 27, reason: "Skin Allergy", reminder: false },
    { day: "Friday", time: "11:00 AM", patient: "Karim Zouaoui", status: "completed", age: 39, reason: "Annual Checkup", reminder: true },
  ];

  const getAppointmentsForSlot = (day, time) => {
    return appointments.filter(a => a.day === day && a.time === time);
  };

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
              My Appointments
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={28} className="text-[#67e8f9]" />
            <span className="text-lg">December 2025</span>
          </div>
        </div>
      </header>

      {/* STATS CARDS — No money, now with Reminders */}
      <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Today</p>
              <p className="text-4xl font-bold mt-2">{todayStats.total}</p>
            </div>
            <Users size={40} className="text-[#4addbf] opacity-80" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Completed</p>
              <p className="text-4xl font-bold mt-2 text-green-400">{todayStats.completed}</p>
            </div>
            <CheckCircle size={40} className="text-green-400 opacity-80" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Pending</p>
              <p className="text-4xl font-bold mt-2 text-yellow-400">{todayStats.pending}</p>
            </div>
            <AlertCircle size={40} className="text-yellow-400 opacity-80" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Reminders Today</p>
              <p className="text-4xl font-bold mt-2 text-purple-400">{todayStats.reminders}</p>
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
            {weekDays.map(day => (
              <div key={day} className="p-6 text-center font-semibold text-lg">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {timeSlots.map((time, idx) => (
            <div key={time} className={`grid grid-cols-8 ${idx !== timeSlots.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="p-6 text-gray-300 font-medium flex items-center">
                <Clock size={18} className="mr-2 text-[#67e8f9]" />
                {time}
              </div>
              {weekDays.map(day => {
                const slotAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div key={day} className="p-4 min-h-32 border-l border-white/5 hover:bg-white/5 transition-all">
                    {slotAppointments.map((appt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl mb-2 text-sm border ${
                          appt.status === "completed"
                            ? "bg-green-500/20 border-green-400/50"
                            : "bg-yellow-500/20 border-yellow-400/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <UserCheck size={16} />
                          {appt.patient}
                          {appt.reminder && <BellRing size={14} className="text-purple-400 ml-auto" title="Reminder needed" />}
                        </div>
                        <p className="text-xs opacity-80 mt-1">{appt.reason} • {appt.age} years</p>
                        <p className={`text-xs mt-1 ${appt.status === "completed" ? "text-green-300" : "text-yellow-300"}`}>
                          {appt.status === "completed" ? "Completed" : "Reminder Pending"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorAppointments;