// src/pages/DoctorDashboard.jsx
import React, { useState } from "react";
import { FiMenu, FiX, FiCalendar, FiUsers, FiDollarSign, FiMessageSquare, FiSettings, FiLogOut, FiBell, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Demo Data
  const patientTypeData = [
    { name: "New Patient", value: 34, color: "#4addbf" },
    { name: "Old Patient", value: 84, color: "#8b5cf6" },
    { name: "Online Consultancy", value: 18, color: "#10b981" },
  ];

  const patientGrowthData = [
    { day: "Mon", patients: 38 },
    { day: "Tue", patients: 42 },
    { day: "Wed", patients: 48 },
    { day: "Thu", patients: 45 },
    { day: "Fri", patients: 52 },
    { day: "Sat", patients: 40 },
    { day: "Sun", patients: 35 },
  ];

  const requestData = [
    { name: "Venkatesh", date: "19 Jan", time: "01:00PM", status: "pending" },
    { name: "Rishi Kiran", date: "14 Jan", time: "02:00PM", status: "approved" },
    { name: "Chinna Vel", date: "15 Jan", time: "12:00 PM", status: "rejected" },
  ];

  const menuItems = [
    { icon: FiCalendar, label: "Overview", active: true },
    { icon: FiCalendar, label: "Appointments", count: 48 },
    { icon: FiUsers, label: "My Patients" },
    { icon: FiDollarSign, label: "Payments" },
    { icon: FiMessageSquare, label: "Messages", count: 5 },
    { icon: FiSettings, label: "Settings" },
    { icon: FiLogOut, label: "Logout", danger: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <motion.div initial={{ x: -300 }} animate={{ x: sidebarOpen ? 0 : -300 }} className="fixed lg:relative z-50 w-72 h-full bg-[#0F172A] text-white shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4addbf] rounded-xl flex items-center justify-center text-2xl font-bold text-black">M</div>
            <h1 className="text-2xl font-bold">MedLink</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><FiX size={28} /></button>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] rounded-full ring-4 ring-[#4addbf]/30 flex items-center justify-center text-3xl font-bold text-white">H</div>
            <div>
              <h3 className="font-semibold text-lg">Dr. Henry</h3>
              <p className="text-white/60 text-sm">MBBS • FCPS • MD(Medicine)</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${item.active ? "bg-[#4addbf] text-black font-medium shadow-lg" : "hover:bg-white/10"} ${item.danger ? "text-red-400 hover:bg-red-400/10" : ""}`}>
              <item.icon size={22} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{item.count}</span>}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><FiMenu size={28} /></button>
              <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search Appointment, Patient or etc" className="pl-12 pr-6 py-3 w-96 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4addbf]" />
              </div>
              <button className="relative"><FiBell size={24} /><span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span></button>
              <span className="text-sm text-gray-600">15 January 2024</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Welcome Dr.Henry</h1>
            <p className="text-gray-600 text-lg">Have a nice day at great work</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: "Appointments", value: 48, icon: FiCalendar, color: "from-blue-500 to-blue-600" },
              { label: "Online Consultancy", value: 18, icon: FiUsers, color: "from-green-500 to-emerald-600" },
              { label: "Pendings", value: 20, icon: FiDollarSign, color: "from-purple-500 to-purple-600" },
              { label: "Request", value: 12, icon: FiMessageSquare, color: "from-cyan-500 to-cyan-600" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <stat.icon size={48} className="opacity-80" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row - Charts */}
          <div className="grid grid-cols-12 gap-6">
            {/* Appointment Requests */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Appointment Request</h3>
                <a href="#" className="text-[#4addbf] text-sm">See all</a>
              </div>
              <div className="space-y-4">
                {requestData.map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <p className="font-medium">{req.name}</p>
                        <p className="text-sm text-gray-600">{req.date} • {req.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm">Reject</button>
                      <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm">Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Analysis - Pie Chart */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Patient Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={patientTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {patientTypeData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold">48 Patients</p>
                <p className="text-gray-600">15 Jan 2024</p>
              </div>
            </div>
          </div>

          {/* Patient Growth - Line Chart */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Patient Growth This Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#4addbf" strokeWidth={4} dot={{ fill: "#4addbf", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;