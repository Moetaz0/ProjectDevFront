import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pill,
  Search,
  Plus,
  X,
  Calendar,
  User,
  FileText,
  Loader,
  Eye,
} from "lucide-react";
import { getUserFromToken } from "../../utils/jwt";

const DoctorPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPrescriptionPage, setCurrentPrescriptionPage] = useState(1);
  const [prescriptionItemsPerPage, setPrescriptionItemsPerPage] = useState(6);

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    let filtered = prescriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStartDate || filterEndDate) {
      filtered = filtered.filter((p) => {
        const prescriptionDate = new Date(p.createdAt);
        const start = filterStartDate ? new Date(filterStartDate) : null;
        const end = filterEndDate ? new Date(filterEndDate) : null;

        if (start && end) {
          return prescriptionDate >= start && prescriptionDate <= end;
        } else if (start) {
          return prescriptionDate >= start;
        } else if (end) {
          return prescriptionDate <= end;
        }
        return true;
      });
    }

    setFilteredPrescriptions(filtered);
    setCurrentPrescriptionPage(1); // Reset to first page when filtering
  }, [searchTerm, filterStartDate, filterEndDate, prescriptions]);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const user = getUserFromToken();
      if (!user?.userId) {
        console.error("No user ID found");
        return;
      }

      // Fetch prescriptions for this doctor
      const response = await fetch(
        `http://localhost:8000/prescriptions/doctor/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Prescriptions fetched:", data);
        const list = Array.isArray(data) ? data : [];
        setPrescriptions(list);

        // Derive patient list directly from prescriptions (each has patientId)
        const uniquePatients = [];
        const patientIds = new Set();

        list.forEach((p) => {
          const id = p.patientId || p.patient?.id;
          if (!id || patientIds.has(id)) return;
          patientIds.add(id);
          uniquePatients.push({
            id,
            name: p.patientName || p.patient?.username || "Patient",
            email: p.patient?.email || "",
          });
        });

        if (uniquePatients.length) {
          setPatients(uniquePatients);
        }
      } else {
        console.error("Failed to fetch prescriptions");
        setPrescriptions([]);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const user = getUserFromToken();
      if (!user?.userId) return;

      // Fetch doctor's appointments to get patients
      const response = await fetch(
        `http://localhost:8000/appointments/doctor/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const appointments = await response.json();
        // Extract unique patients
        const uniquePatients = [];
        const patientIds = new Set();

        appointments.forEach((apt) => {
          if (apt.client && !patientIds.has(apt.client.id)) {
            patientIds.add(apt.client.id);
            uniquePatients.push({
              id: apt.client.id,
              name: apt.client.username,
              email: apt.client.email,
            });
          }
        });

        setPatients(uniquePatients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [fetchPrescriptions, fetchPatients]);

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const user = getUserFromToken();

      const prescriptionData = {
        ...newPrescription,
        doctorId: user.userId,
        status: "APPROVED",
      };

      const response = await fetch(
        `http://localhost:8000/prescriptions/create/${user.userId}/${newPrescription.patientId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(prescriptionData),
        }
      );

      if (response.ok) {
        alert("Prescription created successfully!");
        setShowCreateModal(false);
        setNewPrescription({
          patientId: "",
          doctorId: "",
          medicineName: "",
          dosage: "",
          instructions: "",
          createdAt: new Date().toISOString().split("T")[0],
        });
        fetchPrescriptions();
      } else {
        alert("Failed to create prescription");
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Error creating prescription");
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/prescriptions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        alert("Prescription deleted successfully!");
        fetchPrescriptions();
      } else {
        alert("Failed to delete prescription");
      }
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Error deleting prescription");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/doctor/dashboard")}
              className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              Prescriptions Management
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={20} />
            New Prescription
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin" size={48} />
        </div>
      ) : (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* SEARCH AND FILTER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-[100] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6"
          >
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by medication or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-400 focus:outline-none focus:border-[#4addbf] transition-all"
                />
              </div>

              {/* Date Range Filters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Calendar
                    size={18}
                    className="text-[#4addbf] flex-shrink-0"
                  />
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="bg-transparent text-gray-300 text-sm focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Calendar
                    size={18}
                    className="text-[#67e8f9] flex-shrink-0"
                  />
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="bg-transparent text-gray-300 text-sm focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || filterStartDate || filterEndDate) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStartDate("");
                      setFilterEndDate("");
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          {/* PRESCRIPTIONS GRID */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Prescriptions</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {filteredPrescriptions.length} total prescriptions
                </span>
                <label className="text-gray-300 font-medium text-sm">
                  Items per page:
                </label>
                <select
                  value={prescriptionItemsPerPage}
                  onChange={(e) => {
                    setPrescriptionItemsPerPage(parseInt(e.target.value));
                    setCurrentPrescriptionPage(1);
                  }}
                  className="px-3 py-1 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#4addbf] transition-all"
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions
                .slice(
                  (currentPrescriptionPage - 1) * prescriptionItemsPerPage,
                  currentPrescriptionPage * prescriptionItemsPerPage
                )
                .map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#4addbf]/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9]">
                        <Pill size={24} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {prescription.medicineName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {prescription.dosage}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-300 flex items-center gap-2">
                        <User size={16} className="text-[#67e8f9]" />
                        <span className="text-sm">
                          {prescription.patient.username || "Patient"}
                        </span>
                      </p>

                      <p className="text-gray-300 flex items-center gap-2">
                        <Calendar size={16} className="text-[#67e8f9]" />
                        <span className="text-sm">
                          Started At : {prescription.createdAt}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowViewModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* PRESCRIPTIONS PAGINATION CONTROLS */}
            {filteredPrescriptions.length > 0 && (
              <div className="flex items-center justify-between mt-8 p-4 bg-black/40 border border-white/10 rounded-2xl">
                <div className="text-gray-300 text-sm">
                  Showing{" "}
                  {Math.min(
                    (currentPrescriptionPage - 1) * prescriptionItemsPerPage +
                      1,
                    filteredPrescriptions.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPrescriptionPage * prescriptionItemsPerPage,
                    filteredPrescriptions.length
                  )}{" "}
                  of {filteredPrescriptions.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPrescriptionPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                    disabled={currentPrescriptionPage === 1}
                    className="px-3 py-1 bg-[#4addbf]/20 border border-[#4addbf] text-white rounded-lg text-sm hover:bg-[#4addbf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <div className="flex gap-1">
                    {Array.from({
                      length: Math.ceil(
                        filteredPrescriptions.length / prescriptionItemsPerPage
                      ),
                    }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPrescriptionPage(i + 1)}
                        className={`px-2 py-1 rounded-lg text-sm transition-all ${
                          currentPrescriptionPage === i + 1
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
                      setCurrentPrescriptionPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(
                            filteredPrescriptions.length /
                              prescriptionItemsPerPage
                          )
                        )
                      )
                    }
                    disabled={
                      currentPrescriptionPage ===
                      Math.ceil(
                        filteredPrescriptions.length / prescriptionItemsPerPage
                      )
                    }
                    className="px-3 py-1 bg-[#4addbf]/20 border border-[#4addbf] text-white rounded-lg text-sm hover:bg-[#4addbf]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          {filteredPrescriptions.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              <Pill size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No prescriptions found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterStartDate || filterEndDate
                  ? "Try adjusting your filters"
                  : "Create your first prescription to get started."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CREATE PRESCRIPTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9]">
                  <Pill size={28} className="text-black" />
                </div>
                <h2 className="text-3xl font-bold">New Prescription</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <User size={18} className="text-[#67e8f9]" />
                  Patient
                </label>
                <select
                  required
                  value={newPrescription.patientId}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      patientId: e.target.value,
                    })
                  }
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#67e8f9] transition-all"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication Name */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <Pill size={18} className="text-[#67e8f9]" />
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  value={newPrescription.medicineName}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      medicationName: e.target.value,
                    })
                  }
                  placeholder="e.g., Amoxicillin"
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#67e8f9] transition-all"
                />
              </div>

              {/* Dosage and Frequency */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 mb-2 block">Dosage</label>
                  <input
                    type="text"
                    required
                    value={newPrescription.dosage}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        dosage: e.target.value,
                      })
                    }
                    placeholder="e.g., 500mg"
                    className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#67e8f9] transition-all"
                  />
                </div>

                <div>
                  <label className="text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-[#67e8f9]" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newPrescription.startDate}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#67e8f9] transition-all"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-[#67e8f9]" />
                  Instructions
                </label>
                <textarea
                  value={newPrescription.instructions}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="Additional instructions for the patient..."
                  rows={4}
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#67e8f9] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* VIEW PRESCRIPTION MODAL */}
      {showViewModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-black via-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4addbf] to-[#67e8f9]">
                  <Pill size={28} className="text-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Prescription Details</h2>
                  <p className="text-gray-400">
                    {selectedPrescription.medicineName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">
                  Medication Information
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong>Medication:</strong>{" "}
                    {selectedPrescription.medicineName}
                  </p>
                  <p>
                    <strong>Dosage:</strong> {selectedPrescription.dosage}
                  </p>

                  <p>
                    <strong>Start Date:</strong>{" "}
                    {selectedPrescription.createdAt
                      ? new Date(
                          selectedPrescription.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Instructions</h3>
                  <p className="text-gray-300 whitespace-pre-line">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4">Patient Information</h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <strong>Patient:</strong>{" "}
                    {selectedPrescription.patient.username || "N/A"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
