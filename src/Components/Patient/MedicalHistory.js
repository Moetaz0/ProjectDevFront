import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

// Sample medical history data
const medicalHistoryData = [
  { id: 1, date: "2025-10-01", type: "Consultation", status: "done", doctor: "Dr. Smith", notes: "Routine check-up" },
  { id: 2, date: "2025-09-15", type: "Lab Test", status: "done", doctor: "Dr. Lee", notes: "Blood test" },
  { id: 3, date: "2025-08-30", type: "Consultation", status: "requested", doctor: "Dr. Khan", notes: "Follow-up appointment" },
  { id: 4, date: "2025-08-10", type: "Vaccination", status: "done", doctor: "Dr. Garcia", notes: "Flu shot" },
  { id: 5, date: "2025-07-22", type: "Consultation", status: "done", doctor: "Dr. Brown", notes: "General consultation" },
  { id: 6, date: "2025-06-15", type: "Lab Test", status: "done", doctor: "Dr. Wilson", notes: "Urine test" },
  { id: 7, date: "2025-05-05", type: "Consultation", status: "done", doctor: "Dr. Martinez", notes: "Follow-up visit" },
  { id: 8, date: "2025-04-10", type: "Vaccination", status: "done", doctor: "Dr. Davis", notes: "Hepatitis B vaccine" },
];

const statusColors = {
  done: "bg-green-500",
  requested: "bg-yellow-400",
  pending: "bg-red-500",
};

const ITEMS_PER_PAGE = 4;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b]/90 text-white p-3 rounded-xl shadow-lg border border-[#4addbf]/50 backdrop-blur-md">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((item) => (
          <p key={item.dataKey} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            ></span>
            {item.dataKey}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MedicalHistory = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = medicalHistoryData.filter((record) => {
    const matchesFilter = filter === "all" || record.status === filter;
    const matchesSearch =
      record.doctor.toLowerCase().includes(search.toLowerCase()) ||
      record.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Prepare data for chart
  const chartData = filteredData.reduce((acc, curr) => {
    const month = curr.date.slice(0, 7); // YYYY-MM
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing[curr.type] = (existing[curr.type] || 0) + 1;
    } else {
      acc.push({ month, [curr.type]: 1 });
    }
    return acc;
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-[#0f172a] min-h-screen text-white pt-36 pb-7 font-roboto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4addbf] text-center mb-12">
          My Medical History
        </h1>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-6 md:px-36">
          <div className="relative w-full md:w-1/2">
            <FiSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#4addbf] backdrop-blur-sm shadow-md transition-all"
            />
          </div>

          <div className="relative w-full md:w-1/4">
            <button
              className="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#4addbf] backdrop-blur-sm shadow-md transition-all"
              onClick={() =>
                setExpanded(expanded === "filter" ? null : "filter")
              }
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {expanded === "filter" ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            <AnimatePresence>
              {expanded === "filter" && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute mt-2 w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden z-50"
                >
                  {["all", "done", "requested", "pending"].map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setFilter(opt);
                        setExpanded(null);
                        setCurrentPage(1);
                      }}
                      className="p-3 text-white cursor-pointer hover:bg-[#4addbf]/50 transition-all"
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 md:px-36 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-md hover:shadow-[#4addbf]/50 transition-all">
            <h2 className="text-xl font-semibold text-[#67e8f9] mb-4">
              Visits Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <XAxis
                  dataKey="month"
                  stroke="#67e8f9"
                  tick={{ fill: "#67e8f9", fontSize: 14, fontWeight: 600 }}
                />
                <YAxis
                  stroke="#67e8f9"
                  tick={{ fill: "#67e8f9", fontSize: 14, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
                <Legend
                  wrapperStyle={{ color: "white", fontWeight: "bold" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Consultation"
                  stackId="a"
                  fill="url(#consultGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="Lab Test"
                  stackId="a"
                  fill="url(#labGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="Vaccination"
                  stackId="a"
                  fill="url(#vacGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
                <defs>
                  <linearGradient
                    id="consultGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4addbf" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="labGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="vacGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline / Cards */}
        <div className="relative px-6 md:px-36 mb-12">
          <div className="border-l border-white/20 absolute h-full top-0 left-5 md:left-28"></div>
          <div className="flex flex-col gap-8">
            {paginatedData.map((record, i) => (
              <motion.div
                key={record.id}
                className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className={`w-4 h-4 rounded-full ${statusColors[record.status]} absolute left-0 md:left-8 mt-2 shadow-lg`}
                ></div>
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 flex-1 shadow-md hover:shadow-[#4addbf]/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-[#67e8f9]">
                      {record.type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-xl text-sm ${statusColors[record.status]} text-black font-bold`}
                    >
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-1">Doctor: {record.doctor}</p>
                  <p className="text-gray-400 text-sm">{record.notes}</p>
                  <p className="text-gray-500 text-xs mt-2">{record.date}</p>
                </div>
              </motion.div>
            ))}
            {filteredData.length === 0 && (
              <p className="text-center text-gray-400 mt-6">No records found.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 px-6 md:px-24 mb-12">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#4addbf]/50 transition-all disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-xl transition-all ${
                currentPage === i + 1
                  ? "bg-[#4addbf]/80"
                  : "bg-white/10 hover:bg-[#4addbf]/50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#4addbf]/50 transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MedicalHistory;
