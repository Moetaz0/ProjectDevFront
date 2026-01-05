// src/pages/DoctorDashboard.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FiMenu,
  FiX,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import DoctorNotificationDropdown from "./DoctorNotificationDropdown";

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [refillRequests, setRefillRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
  });
  const API_URL = "http://localhost:8000";
  const username = localStorage.getItem("username") || user?.username;
  const role = localStorage.getItem("role") || user?.role;
  console.log("Doctor role:", role);
  let doctorId = null;
  if (role === "DOCTOR") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        doctorId =
          decoded.userId || decoded.id || decoded.sub || decoded.doctorId;
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }
  console.log("Doctor username:", username);
  console.log("Doctor user from context:", user);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!doctorId) return;

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch appointments
        const appointmentsResponse = await axios.get(
          `${API_URL}/appointments/doctor/${doctorId}`,
          { headers }
        );
        const appointments = appointmentsResponse.data;

        // Calculate appointment stats
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(
          (apt) => apt.status === "COMPLETED"
        ).length;
        const pendingAppointments = appointments.filter(
          (apt) => apt.status === "PENDING"
        ).length;

        // Extract unique patients from appointments
        const uniquePatientIds = new Set();
        appointments.forEach((apt) => {
          if (apt.client && apt.client.id) {
            uniquePatientIds.add(apt.client.id);
          }
        });
        const totalPatients = uniquePatientIds.size;

        // Fetch prescriptions
        let totalPrescriptions = 0;
        let activePrescriptions = 0;
        try {
          const prescriptionsResponse = await axios.get(
            `${API_URL}/prescriptions/doctor/${doctorId}`,
            { headers }
          );
          const prescriptions = prescriptionsResponse.data;
          totalPrescriptions = prescriptions.length;
          activePrescriptions = prescriptions.filter(
            (p) => p.status?.toLowerCase() === "active"
          ).length;
        } catch (err) {
          console.log("Prescriptions endpoint not available:", err);
        }

        setStats({
          totalAppointments,
          completedAppointments,
          pendingAppointments,
          totalPatients,
          totalPrescriptions,
          activePrescriptions,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, [doctorId]);

  // Fetch refill requests on mount
  useEffect(() => {
    const fetchRefills = async () => {
      if (!doctorId) return;

      try {
        // First, fetch doctor's appointments to get patient IDs
        const appointmentsResponse = await axios.get(
          `${API_URL}/appointments/doctor/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const appointments = appointmentsResponse.data;
        const uniquePatientIds = new Set();
        const patientMap = {};

        // Extract unique patients and map IDs to names
        appointments.forEach((apt) => {
          if (apt.client && apt.client.id) {
            uniquePatientIds.add(apt.client.id);
            patientMap[apt.client.id] = {
              name: apt.client.username || apt.client.fullName || "Patient",
              email: apt.client.email,
            };
          }
        });

        // Fetch refill requests for all patients
        if (uniquePatientIds.size > 0) {
          const refillPromises = Array.from(uniquePatientIds).map((patientId) =>
            axios
              .get(`${API_URL}/prescriptions/doctor/${doctorId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
              .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                return data.map((refill) => ({
                  ...refill,
                  patientId,
                  patientName: patientMap[patientId]?.name || "Patient",
                }));
              })
              .catch(() => [])
          );

          const allRefills = await Promise.all(refillPromises);
          const flatRefills = allRefills.flat();

          // Transform refills into request format
          const requests = flatRefills.map((refill) => ({
            id: refill.id,
            patientName: refill.patientName,
            medication: refill.medicineName || "Medication",
            requestedAt: new Date(
              refill.createdAt || Date.now()
            ).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            }),
            status: refill.status?.toLowerCase() || "pending",
          }));

          setRefillRequests(requests);
        } else {
          setRefillRequests([]);
        }
      } catch (err) {
        console.error("Failed to fetch refill requests:", err);
        // Fallback demo data if API fails
        setRefillRequests([
          {
            id: 1,
            patientName: "Venkatesh",
            medication: "Amoxicillin",
            requestedAt: "19 Jan",
            status: "pending",
          },
          {
            id: 2,
            patientName: "Rishi Kiran",
            medication: "Paracetamol",
            requestedAt: "18 Jan",
            status: "pending",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRefills();
  }, [doctorId]);

  // Handle Approve / Reject

  const handleLogout = () => {
    logout();
    window.location.href = "/SignIn";
  };

  const pendingCount = refillRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const menuItems = [
    {
      icon: FiCalendar,
      label: "Overview",
      path: "/doctor/dashboard",
      count: 0,
    },
    {
      icon: FiCalendar,
      label: "Appointments",
      path: "/doctor/appointments",
      count: stats.totalAppointments,
    },
    {
      icon: FiUsers,
      label: "My Patients",
      path: "/doctor/patients",
      count: stats.totalPatients,
    },
    {
      icon: FiFileText,
      label: "Prescriptions",
      path: "/doctor/prescriptions",
      count: stats.totalPrescriptions,
    },
    {
      icon: FiMessageSquare,
      label: "Messages",
      path: "/DoctorMessages",
      count: 0,
    },
    { icon: FiSettings, label: "Settings", path: "/doctor/settings", count: 0 },
    { icon: FiLogOut, label: "Logout", danger: true, onClick: handleLogout },
  ];

  // Charts data based on stats
  const patientTypeData = [
    { name: "Completed", value: stats.completedAppointments, color: "#4addbf" },
    { name: "Pending", value: stats.pendingAppointments, color: "#8b5cf6" },
    { name: "Total Patients", value: stats.totalPatients, color: "#10b981" },
  ];

  const patientGrowthData = [
    { day: "Total Appointments", value: stats.totalAppointments },
    { day: "Completed", value: stats.completedAppointments },
    { day: "Pending", value: stats.pendingAppointments },
    { day: "Total Prescriptions", value: stats.totalPrescriptions },
    { day: "Active Prescriptions", value: stats.activePrescriptions },
    { day: "Total Patients", value: stats.totalPatients },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed lg:relative z-50 w-72 h-full bg-[#0F172A] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4addbf] rounded-xl flex items-center justify-center text-2xl font-bold text-black">
              M
            </div>
            <h1 className="text-2xl font-bold">MedLink</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX size={28} />
          </button>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] rounded-full ring-4 ring-[#4addbf]/30 flex items-center justify-center text-3xl font-bold text-white">
              {username?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Dr. {username || "Henry"}
              </h3>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-[#4addbf] text-black font-medium shadow-lg"
                  : "hover:bg-white/10"
              } ${item.danger ? "text-red-400 hover:bg-red-400/10" : ""}`}
            >
              <item.icon size={22} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
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
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <FiMenu size={28} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patient or medicine..."
                  className="pl-12 pr-6 py-3 w-96 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>
              <DoctorNotificationDropdown />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome Dr. {user?.username || "Henry"}
            </h1>
            <p className="text-gray-600 text-lg">
              Here are your prescription refill requests
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Appointments",
                value: stats.totalAppointments,
                icon: FiCalendar,
                color: "from-blue-500 to-blue-600",
              },
              {
                label: "Completed",
                value: stats.completedAppointments,
                icon: FiCalendar,
                color: "from-green-500 to-emerald-600",
              },
              {
                label: "Active Prescriptions",
                value: stats.activePrescriptions,
                icon: FiFileText,
                color: "from-purple-500 to-purple-600",
              },
              {
                label: "Total Patients",
                value: stats.totalPatients,
                icon: FiUsers,
                color: "from-cyan-500 to-cyan-600",
              },
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

          {/* REAL PRESCRIPTION REFILL REQUESTS */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Prrescriptions</h3>
                <span className="text-[#4addbf] text-sm font-medium">
                  {pendingCount} pending
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading requests...
                </div>
              ) : refillRequests.filter((r) => r.status === "pending")
                  .length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No refill requests
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {refillRequests
                      .filter((r) => r.status === "pending")
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#4addbf] to-[#39c6a5] rounded-full flex items-center justify-center text-xl font-bold text-black">
                              {req.patientName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">
                                {req.patientName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {req.medication} • Requested on{" "}
                                {req.requestedAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination Controls */}
                  {refillRequests.filter((r) => r.status === "pending").length >
                    itemsPerPage && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          refillRequests.filter((r) => r.status === "pending")
                            .length
                        )}{" "}
                        of{" "}
                        {
                          refillRequests.filter((r) => r.status === "pending")
                            .length
                        }{" "}
                        requests
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <FiChevronLeft size={20} />
                        </button>
                        <span className="px-4 py-2 bg-[#4addbf] text-black rounded-lg font-medium">
                          {currentPage}
                        </span>
                        <span className="text-gray-600">
                          of{" "}
                          {Math.ceil(
                            refillRequests.filter((r) => r.status === "pending")
                              .length / itemsPerPage
                          )}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                Math.ceil(
                                  refillRequests.filter(
                                    (r) => r.status === "pending"
                                  ).length / itemsPerPage
                                ),
                                prev + 1
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(
                              refillRequests.filter(
                                (r) => r.status === "pending"
                              ).length / itemsPerPage
                            )
                          }
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <FiChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Patient Analysis */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Patient Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {patientTypeData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">Dashboard Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4addbf"
                  strokeWidth={4}
                  dot={{ fill: "#4addbf", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
