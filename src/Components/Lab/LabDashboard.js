// LabDashboard.jsx — EXACT same design as your DoctorDashboard
import React, { useState } from "react";
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiUpload, 
  FiSettings, 
  FiLogOut, 
  FiBell, 
  FiSearch,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const LabDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Lab-specific data
  const reportTypeData = [
    { name: "Blood Tests", value: 145, color: "#4addbf" },
    { name: "X-Ray & Scans", value: 89, color: "#8b5cf6" },
    { name: "Urine Analysis", value: 62, color: "#10b981" },
    { name: "Lipid Profile", value: 41, color: "#f59e0b" },
  ];

  const weeklyReportsData = [
    { day: "Mon", reports: 38 },
    { day: "Tue", reports: 45 },
    { day: "Wed", reports: 52 },
    { day: "Thu", reports: 48 },
    { day: "Fri", reports: 61 },
    { day: "Sat", reports: 40 },
    { day: "Sun", reports: 35 },
  ];

  const recentUploads = [
    { id: 101, patient: "Sarah Ali", test: "CBC + ESR", doctor: "Dr. Henry", time: "10:30 AM", status: "delivered" },
    { id: 102, patient: "Ahmed Ben Salem", test: "X-Ray Chest", doctor: "Dr. Chen", time: "02:15 PM", status: "pending" },
    { id: 103, patient: "Nour Jlassi", test: "Thyroid Panel", doctor: "Dr. Henry", time: "04:00 PM", status: "pending" },
  ];

  const menuItems = [
    { icon: FiHome, label: "Overview", active: true },
    { icon: FiUpload, label: "Upload Report", count: 8,path: "/Upload-Report" },
    { icon: FiSettings, label: "Settings" ,path: "/Lab-Settings" },
    { icon: FiLogOut, label: "Logout", danger: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR - EXACT same as DoctorDashboard */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed lg:relative z-50 w-72 h-full bg-[#0F172A] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4addbf] rounded-xl flex items-center justify-center text-2xl font-bold text-black">
              L
            </div>
            <h1 className="text-2xl font-bold">MediLink</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX size={28} />
          </button>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] rounded-full ring-4 ring-[#4addbf]/30 flex items-center justify-center text-3xl font-bold text-white">
              L
            </div>
            <div>
              <h3 className="font-semibold text-lg">City Diagnostic Lab</h3>
              <p className="text-white/60 text-sm">Certified Pathology Center</p>
            </div>
          </div>
        </div>

       <nav className="p-4 space-y-2">
  {menuItems.map((item, i) => (
    <button
      key={i}
      onClick={() => {
        if (item.danger) {
          // Optional: Add logout logic here
          console.log("Logging out...");
          // navigate("/login") or clear auth
        } else if (item.path) {
          navigate(item.path);   // This was missing!
        }
      }}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all
        ${item.active ? "bg-[#4addbf] text-black font-medium shadow-lg" : "hover:bg-white/10"}
        ${item.danger ? "text-red-400 hover:bg-red-400/10" : ""}`}
    >
      <item.icon size={22} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.count && (
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
          {item.count}
        </span>
      )}
    </button>
  ))}
</nav>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <FiMenu size={28} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Lab Overview</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patient, test, or doctor..."
                  className="pl-12 pr-6 py-3 w-96 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>
              <button className="relative">
                <FiBell size={24} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <span className="text-sm text-gray-600">15 Dec 2025</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Welcome back, Lab</h1>
            <p className="text-gray-600 text-lg">Manage reports and stay connected with doctors</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Reports", value: 337, icon: FiFileText, color: "from-blue-500 to-blue-600" },
              { label: "Delivered Today", value: 68, icon: FiCheckCircle, color: "from-green-500 to-emerald-600" },
              { label: "Pending Uploads", value: 24, icon: FiClock, color: "from-yellow-500 to-amber-600" },
              { label: "Urgent Reports", value: 11, icon: FiAlertCircle, color: "from-red-500 to-rose-600" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-lg`}
              >
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

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-6">
            {/* Recent Uploads */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Recent Report Uploads</h3>
                <a href="#" className="text-[#4addbf] text-sm">See all</a>
              </div>
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] rounded-full flex items-center justify-center text-white font-bold">
                        {upload.patient.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{upload.patient}</p>
                        <p className="text-sm text-gray-600">{upload.test} • To: {upload.doctor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{upload.time}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        upload.status === "delivered" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {upload.status === "delivered" ? "Delivered" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Type Analysis */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Report Types This Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportTypeData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-3xl font-bold">337 Reports</p>
                <p className="text-gray-600">December 2025</p>
              </div>
            </div>
          </div>

          {/* Weekly Report Trend */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Weekly Report Upload Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyReportsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#4addbf" strokeWidth={4} dot={{ fill: "#4addbf", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;