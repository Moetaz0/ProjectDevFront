import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import FilterDropdown from "../FilterDropdown ";

const prescriptions = [
  { id: 1, name: "Amoxicillin 500mg", doctor: "Dr. Smith", details: "Take twice daily for 7 days" },
  { id: 2, name: "Ibuprofen 200mg", doctor: "Dr. Lee", details: "Take every 8 hours with food" },
  { id: 3, name: "Metformin 850mg", doctor: "Dr. Khan", details: "Take once daily before breakfast" },
  { id: 4, name: "Lisinopril 10mg", doctor: "Dr. Garcia", details: "Take once daily in the morning" },
  { id: 5, name: "Atorvastatin 20mg", doctor: "Dr. Brown", details: "Take once daily at bedtime" },
  { id: 6, name: "Omeprazole 20mg", doctor: "Dr. Wilson", details: "Take once daily before meals" },
  { id: 7, name: "Amlodipine 5mg", doctor: "Dr. Martinez", details: "Take once daily in the morning" },
  { id: 8, name: "Simvastatin 40mg", doctor: "Dr. Davis", details: "Take once daily at bedtime" },
  { id: 9, name: "Gabapentin 300mg", doctor: "Dr. Thompson", details: "Take three times daily" },
  { id: 10, name: "Sertraline 50mg", doctor: "Dr. White", details: "Take once daily in the morning" },
];

const ModernPrescriptionGrid = () => {
  const [status, setStatus] = useState(
    prescriptions.reduce((acc, pres) => {
      acc[pres.id] = "pending"; // pending | requested | done
      return acc;
    }, {})
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | requested | done
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const requestPrescription = (id) => {
    setStatus((prev) => ({ ...prev, [id]: "requested" }));
    setTimeout(() => {
      setStatus((prev) => ({ ...prev, [id]: "done" }));
    }, 2000);
  };

  const filteredPrescriptions = prescriptions.filter((pres) => {
    const matchesSearch =
      pres.name.toLowerCase().includes(search.toLowerCase()) ||
      pres.doctor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ? true : status[pres.id] === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const displayedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Navbar />
      <div className="bg-[#0f172a] min-h-screen text-white py-28 px-32 font-roboto">
        <h1 className="text-4xl font-bold text-[#4addbf] mb-8 text-center">My Prescriptions</h1>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search prescriptions or doctors..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-1/2 p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4addbf] focus:border-transparent backdrop-blur-sm transition-all shadow-md"
          />

          {/* Filter Dropdown */}
          <FilterDropdown
  value={filter}
  onChange={(val) => { setFilter(val); setCurrentPage(1); }}
  options={[
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "requested", label: "Requested" },
    { value: "done", label: "Done" },
  ]}
/>

        </div>

        {/* Prescription Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {displayedPrescriptions.map((pres) => (
              <motion.div
                key={pres.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden cursor-pointer hover:scale-105 hover:shadow-[0_10px_40px_rgba(74,221,191,0.5)] transition-all"
              >
                {/* Prescription Info */}
                <div>
                  <h2 className="text-xl font-bold text-[#67e8f9] mb-2">{pres.name}</h2>
                  <p className="text-gray-300 text-sm mb-2">{pres.details}</p>
                  <p className="text-gray-400 text-xs">Doctor: {pres.doctor}</p>
                </div>

                {/* Status & Action */}
                <div className="mt-4 flex items-center justify-between">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      status[pres.id] === "pending"
                        ? "bg-yellow-400 animate-pulse"
                        : status[pres.id] === "requested"
                        ? "bg-blue-400 animate-ping"
                        : "bg-green-400"
                    }`}
                  ></div>
                  <button
                    onClick={() => requestPrescription(pres.id)}
                    disabled={status[pres.id] !== "pending"}
                    className={`px-5 py-2 rounded-full font-semibold text-gray-900 transition-all ${
                      status[pres.id] === "pending"
                        ? "bg-[#4addbf] hover:bg-[#39c6a5]"
                        : "bg-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {status[pres.id] === "pending"
                      ? "Request"
                      : status[pres.id] === "requested"
                      ? "Processing..."
                      : "Done"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#4addbf] transition"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-full transition ${
                  currentPage === i + 1
                    ? "bg-[#4addbf]"
                    : "bg-white/10 hover:bg-[#4addbf]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#4addbf] transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ModernPrescriptionGrid;
