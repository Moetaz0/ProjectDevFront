// DoctorPatients.jsx — My Patients page matching your aesthetic
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader,
  X,
  Calendar,
  Clock,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Syringe,
  AlertCircle,
  Scale,
  Ruler,
} from "lucide-react";
import { getDoctorAppointments, createAppointment } from "../../services/api";
import { getUserFromToken } from "../../utils/jwt";

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const user = getUserFromToken();
        if (!user?.userId) {
          console.error("No user ID found");
          setLoading(false);
          return;
        }

        // First, fetch all appointments for this doctor
        const appointments = await getDoctorAppointments(user.userId);
        console.log("Fetched appointments:", appointments);

        // Ensure appointments is an array
        const appointmentsArray = Array.isArray(appointments)
          ? appointments
          : [];

        if (appointmentsArray.length === 0) {
          console.warn("No appointments found for this doctor");
          setLoading(false);
          return;
        }

        // Extract unique patients from appointments (using client object)
        const patientsMap = new Map();
        appointmentsArray.forEach((apt) => {
          if (apt.client && apt.client.id) {
            // Transform client data to match the expected patient structure
            patientsMap.set(apt.client.id, {
              id: apt.client.id,
              name: apt.client.username || "Unknown",
              email: apt.client.email,
              phone: apt.client.phoneNumber,
              age: apt.client.age || "N/A",
              gender: apt.client.gender || "N/A",
              bloodType: apt.client.bloodType || "N/A",
              lastVisit: apt.date,
              conditions: apt.notes || "None",
              address: apt.client.address || "N/A",
            });
          }
        });

        const patientsData = Array.from(patientsMap.values());
        console.log("Extracted patients:", patientsData);

        setAllPatients(patientsData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleFilter = () => {
    let filtered = allPatients;
    if (searchName) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (minAge) {
      filtered = filtered.filter((p) => p.age >= parseInt(minAge));
    }
    if (maxAge) {
      filtered = filtered.filter((p) => p.age <= parseInt(maxAge));
    }
    setPatients(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const toggleDetails = (id) => {
    setExpandedPatient(expandedPatient === id ? null : id);
  };

  const handleViewMedicalHistory = async (patient) => {
    setSelectedPatient(patient);
    setShowMedicalHistory(true);
    setLoadingHistory(true);
    try {
      // Fetch medical history for this patient
      const response = await fetch(
        `http://localhost:8000/api/medical-histories/user/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data);
      } else {
        console.error("Failed to fetch medical history");
        setMedicalHistory(null);
      }
    } catch (error) {
      console.error("Error fetching medical history:", error);
      setMedicalHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleScheduleAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowScheduleModal(true);
  };

  const handleCloseModals = () => {
    setShowMedicalHistory(false);
    setShowScheduleModal(false);
    setSelectedPatient(null);
    setMedicalHistory(null);
    setAppointmentData({ date: "", time: "", notes: "" });
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = getUserFromToken();
      if (!user?.userId) {
        alert("Unable to identify doctor. Please log in again.");
        return;
      }

      // Prepare appointment data matching backend entity
      const appointmentPayload = {
        date: appointmentData.date, // LocalDate format: "2025-12-10"
        time: appointmentData.time + ":00", // LocalTime format: "14:30:00"
        notes: appointmentData.notes,
        status: "PENDING",
        client: {
          id: selectedPatient.id,
        },
        doctor: {
          id: user.userId,
        },
      };

      console.log("Creating appointment:", appointmentPayload);
      await createAppointment(appointmentPayload);
      alert("Appointment scheduled successfully!");
      handleCloseModals();

      // Refresh patient list to update last visit
      window.location.reload();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      alert("Failed to schedule appointment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
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
              My Patients
            </h1>
          </div>
          <Users size={28} className="text-[#67e8f9]" />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin" size={48} />
        </div>
      ) : (
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9] shadow-xl">
                  <Users size={32} className="text-black" />
                </div>
                <h3 className="text-2xl font-bold">
                  Patient List ({patients.length})
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-gray-300 font-medium">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#4addbf] transition-all"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {patients.length > 0 ? (
              <>
                {patients
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleDetails(patient.id)}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4addbf] to-[#67e8f9] flex items-center justify-center font-bold text-2xl shadow-xl">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold">
                              {patient.name}
                            </h4>
                            <p className="text-gray-300">
                              Age: {patient.age} • {patient.gender}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Last Visit: {patient.lastVisit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="p-3 rounded-full hover:bg-white/10 transition-all">
                            <FileText size={24} className="text-[#67e8f9]" />
                          </button>
                          {expandedPatient === patient.id ? (
                            <ChevronUp size={28} />
                          ) : (
                            <ChevronDown size={28} />
                          )}
                        </div>
                      </div>

                      {expandedPatient === patient.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-6 border-t border-white/10 pt-6 space-y-4"
                        >
                          <p className="text-gray-300">
                            <strong>Conditions:</strong> {patient.conditions}
                          </p>
                          <p className="text-gray-300">
                            <strong>Phone:</strong> {patient.phone}
                          </p>
                          <p className="text-gray-300">
                            <strong>Email:</strong> {patient.email}
                          </p>
                          <div className="flex gap-4 mt-4">
                            <button
                              onClick={() => handleViewMedicalHistory(patient)}
                              className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                            >
                              View Medical History
                            </button>
                            <button
                              onClick={() => handleScheduleAppointment(patient)}
                              className="px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                            >
                              Schedule Appointment
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between mt-8 p-6 bg-black/40 border border-white/10 rounded-2xl">
                  <div className="text-gray-300">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      patients.length
                    )}{" "}
                    to {Math.min(currentPage * itemsPerPage, patients.length)}{" "}
                    of {patients.length} patients
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-[#4addbf]/20 border border-[#4addbf] text-white rounded-xl hover:bg-[#4addbf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({
                        length: Math.ceil(patients.length / itemsPerPage),
                      }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-xl transition-all ${
                            currentPage === i + 1
                              ? "bg-[#4addbf] text-black font-bold"
                              : "bg-black/40 border border-white/20 text-white hover:bg-white/10"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(patients.length / itemsPerPage)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(patients.length / itemsPerPage)
                      }
                      className="px-4 py-2 bg-[#4addbf]/20 border border-[#4addbf] text-white rounded-xl hover:bg-[#4addbf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 text-xl py-10">
                No patients found matching your filters
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* MEDICAL HISTORY MODAL */}
      {showMedicalHistory && selectedPatient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9]">
                  <FileText size={28} className="text-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Medical History</h2>
                  <p className="text-gray-400">{selectedPatient.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <div className="space-y-6">
              {loadingHistory ? (
                <div className="flex justify-center items-center py-10">
                  <Loader className="animate-spin" size={48} />
                </div>
              ) : medicalHistory ? (
                <>
                  {/* Basic Information */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <User size={20} className="text-[#67e8f9]" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                      <p>
                        <strong>Gender:</strong>{" "}
                        {medicalHistory.gender || "N/A"}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong>{" "}
                        {medicalHistory.dateOfBirth
                          ? new Date(
                              medicalHistory.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Blood Type:</strong>{" "}
                        {medicalHistory.bloodType || "N/A"}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedPatient.phone}
                      </p>
                      <p className="col-span-2">
                        <strong>Email:</strong> {selectedPatient.email}
                      </p>
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Heart size={20} className="text-[#67e8f9]" />
                      Health Metrics
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-gray-300">
                      <p>
                        <strong className="flex items-center gap-1">
                          <Ruler size={16} /> Height:
                        </strong>
                        {medicalHistory.heightCm
                          ? `${medicalHistory.heightCm} cm`
                          : "N/A"}
                      </p>
                      <p>
                        <strong className="flex items-center gap-1">
                          <Scale size={16} /> Weight:
                        </strong>
                        {medicalHistory.weightKg
                          ? `${medicalHistory.weightKg} kg`
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Health Rating:</strong>{" "}
                        {medicalHistory.ratedHealth
                          ? `${medicalHistory.ratedHealth}/10`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Stethoscope size={20} className="text-[#67e8f9]" />
                      Medical Conditions
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {medicalHistory.conditions || "No conditions recorded"}
                    </p>
                  </div>

                  {/* Allergies */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-400" />
                      Allergies
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {medicalHistory.allergies || "No allergies recorded"}
                    </p>
                  </div>

                  {/* Current Medications */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Pill size={20} className="text-[#67e8f9]" />
                      Current Medications
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {medicalHistory.medications || "No medications recorded"}
                    </p>
                  </div>

                  {/* Surgical History */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Syringe size={20} className="text-[#67e8f9]" />
                      Surgical History
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {medicalHistory.surgeries || "No surgeries recorded"}
                    </p>
                  </div>

                  {/* Lifestyle */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Activity size={20} className="text-[#67e8f9]" />
                      Lifestyle
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                      <p>
                        <strong>Smoking Status:</strong>{" "}
                        {medicalHistory.smokingStatus || "N/A"}
                      </p>
                      <p>
                        <strong>Alcohol Consumption:</strong>{" "}
                        {medicalHistory.alcoholConsumption || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Sign-in Notes */}
                  {medicalHistory.notesDaySingIn && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-[#67e8f9]" />
                        Initial Assessment Notes
                      </h3>
                      <p className="text-gray-300 whitespace-pre-line mb-2">
                        {medicalHistory.notesDaySingIn}
                      </p>
                      {medicalHistory.dateOfSignIn && (
                        <p className="text-gray-400 text-sm">
                          <strong>Date:</strong>{" "}
                          {new Date(
                            medicalHistory.dateOfSignIn
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="text-center text-gray-400 text-sm">
                    Last updated:{" "}
                    {medicalHistory.updatedAt
                      ? new Date(medicalHistory.updatedAt).toLocaleString()
                      : "N/A"}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <p className="text-xl mb-2">No medical history found</p>
                  <p className="text-sm">
                    This patient hasn't filled out their medical history yet.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* SCHEDULE APPOINTMENT MODAL */}
      {showScheduleModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9]">
                  <Calendar size={28} className="text-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Schedule Appointment</h2>
                  <p className="text-gray-400">{selectedPatient.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleAppointmentSubmit} className="space-y-6">
              {/* Date Input */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-[#67e8f9]" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={appointmentData.date}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      date: e.target.value,
                    })
                  }
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#67e8f9] transition-all"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={18} className="text-[#67e8f9]" />
                  Appointment Time
                </label>
                <input
                  type="time"
                  required
                  value={appointmentData.time}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      time: e.target.value,
                    })
                  }
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#67e8f9] transition-all"
                />
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-[#67e8f9]" />
                  Notes
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Enter appointment notes or reason for visit..."
                  rows={4}
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#67e8f9] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
