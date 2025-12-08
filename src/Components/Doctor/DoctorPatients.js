// DoctorPatients.jsx — My Patients page matching your aesthetic
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  User,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DoctorPatients = () => {
  const navigate = useNavigate();

  // Mock patient data (replace with real API later)
  const allPatients = [
    { id: 1, name: "John Doe", age: 45, gender: "Male", lastVisit: "2025-11-15", conditions: "Hypertension, Diabetes", phone: "+216 98 765 432", email: "john@example.com" },
    { id: 2, name: "Sarah Ali", age: 32, gender: "Female", lastVisit: "2025-12-01", conditions: "Asthma", phone: "+216 21 345 678", email: "sarah@example.com" },
    { id: 3, name: "Mark Chen", age: 28, gender: "Male", lastVisit: "2025-10-20", conditions: "Allergies", phone: "+216 54 321 987", email: "mark@example.com" },
    { id: 4, name: "Emma Watson", age: 50, gender: "Female", lastVisit: "2025-11-28", conditions: "Arthritis", phone: "+216 87 654 321", email: "emma@example.com" },
    { id: 5, name: "Ahmed Ben Salem", age: 39, gender: "Male", lastVisit: "2025-12-05", conditions: "Back Pain", phone: "+216 12 345 678", email: "ahmed@example.com" },
    { id: 6, name: "Nour Jlassi", age: 24, gender: "Female", lastVisit: "2025-11-10", conditions: "Migraine", phone: "+216 65 432 198", email: "nour@example.com" },
    // Add more as needed
  ];

  const [patients, setPatients] = useState(allPatients);
  const [searchName, setSearchName] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [expandedPatient, setExpandedPatient] = useState(null);

  const handleFilter = () => {
    let filtered = allPatients;
    if (searchName) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (minAge) {
      filtered = filtered.filter(p => p.age >= parseInt(minAge));
    }
    if (maxAge) {
      filtered = filtered.filter(p => p.age <= parseInt(maxAge));
    }
    setPatients(filtered);
  };

  const toggleDetails = (id) => {
    setExpandedPatient(expandedPatient === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              My Patients
            </h1>
          </div>
          <Users size={28} className="text-[#67e8f9]" />
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-10">

        {/* FILTERS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Filter size={32} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Filter Patients</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Search size={18} /> Name
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <User size={18} /> Min Age
              </label>
              <input
                type="number"
                placeholder="Min age"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <User size={18} /> Max Age
              </label>
              <input
                type="number"
                placeholder="Max age"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFilter}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* PATIENTS LIST */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
              <Users size={32} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">Patient List ({patients.length})</h3>
          </div>

          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleDetails(patient.id)}>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4addbf] to-[#67e8f9] flex items-center justify-center font-bold text-2xl shadow-xl">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{patient.name}</h4>
                    <p className="text-gray-300">Age: {patient.age} • {patient.gender}</p>
                    <p className="text-gray-400 text-sm mt-1">Last Visit: {patient.lastVisit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-3 rounded-full hover:bg-white/10 transition-all">
                    <FileText size={24} className="text-[#67e8f9]" />
                  </button>
                  {expandedPatient === patient.id ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                </div>
              </div>

              {expandedPatient === patient.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 border-t border-white/10 pt-6 space-y-4"
                >
                  <p className="text-gray-300"><strong>Conditions:</strong> {patient.conditions}</p>
                  <p className="text-gray-300"><strong>Phone:</strong> {patient.phone}</p>
                  <p className="text-gray-300"><strong>Email:</strong> {patient.email}</p>
                  <div className="flex gap-4 mt-4">
                    <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                      View Medical History
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                      Schedule Appointment
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {patients.length === 0 && (
            <div className="text-center text-gray-400 text-xl py-10">
              No patients found matching your filters
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorPatients;