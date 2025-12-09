import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import FilterDropdown from "../FilterDropdown ";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";

const ModernPrescriptionGrid = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [refillStatus, setRefillStatus] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // prescriptions per page

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");
  let patientId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      patientId =
        decoded.userId || decoded.id || decoded.sub || decoded.patientId;
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const getPrescriptions = async () => {
    if (!patientId) {
      setError("Please log in to view your prescriptions.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [presResponse, refillRequests] = await Promise.all([
        api.get(`/prescriptions/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        getAllRefillRequests(patientId),
      ]);

      const prescriptionsData = presResponse.data || [];
      setPrescriptions(prescriptionsData);

      // Map refill requests by prescription ID for easy lookup
      const latestRefills = {};
      refillRequests.forEach((r) => {
        // Only keep the latest request per prescription
        if (
          !latestRefills[r.prescription.id] ||
          new Date(r.createdAt) >
            new Date(latestRefills[r.prescription.id].createdAt)
        ) {
          latestRefills[r.prescription.id] = r;
        }
      });

      // Set UI refillStatus
      const initialStatus = {};
      prescriptionsData.forEach((p) => {
        const lastRefill = latestRefills[p.id];

        if (p.status === "FULFILLED" || p.status === "APPROVED") {
          initialStatus[p.id] = "done";
        } else if (lastRefill) {
          initialStatus[p.id] =
            lastRefill.status === "PENDING" ? "pending" : "canRefill";
        } else {
          initialStatus[p.id] = "pending";
        }
      });

      setRefillStatus(initialStatus);
    } catch (err) {
      setError("Failed to load prescriptions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPrescriptions();
  }, [patientId]);
  const getAllRefillRequests = async (patientId) => {
    try {
      const response = await api.get(`/prescriptions/refill/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch refill data", err);
      return [];
    }
  };

  const requestPrescription = async (id) => {
    // Prevent multiple requests while pending
    if (refillStatus[id] === "pending") return;

    setRefillStatus((prev) => ({ ...prev, [id]: "pending" }));

    try {
      await api.post(
        `/prescriptions/refill/${id}/${patientId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Prescription refill request sent successfully!");
      setShowSuccess(true);

      setRefillStatus((prev) => ({ ...prev, [id]: "pending" })); // pending until backend updates
    } catch (err) {
      setRefillStatus((prev) => ({ ...prev, [id]: "canRefill" }));
      setErrorMessage("Failed to request prescription refill.");
      setShowError(true);
      console.error(err);
    }
  };

  // THIS IS THE FIXED FILTER — THE ONLY CHANGE YOU NEED
  // Filtered prescriptions as before
  const filteredPrescriptions = prescriptions.filter((pres) => {
    const matchesSearch =
      (pres.medicineName || "").toLowerCase().includes(search.toLowerCase()) ||
      (pres.medicationName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (pres.doctor?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (pres.doctor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (pres.doctor?.username || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const uiStatus = refillStatus[pres.id] || "pending";
    const matchesFilter = filter === "all" || uiStatus === filter;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

  const displayedPrescriptions = filteredPrescriptions.slice(0, 6); // simple for now

  return (
    <>
      <SuccessToast
        message={successMessage}
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorToast
        message={errorMessage}
        show={showError}
        onClose={() => setShowError(false)}
      />
      <Navbar />
      <div className="bg-[#0f172a] min-h-screen text-white py-28 px-8 md:px-32">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4addbf] text-center mb-10">
          My Prescriptions
        </h1>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <input
            type="text"
            placeholder="Search medication or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4addbf]/50"
          />
          <FilterDropdown
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "pending", label: "Can Refill" },
              { value: "done", label: "Refilled" },
            ]}
          />
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="text-center py-20 text-2xl">Loading...</div>
        )}
        {error && (
          <div className="text-center py-20 text-red-400 text-2xl">{error}</div>
        )}

        {!loading && !error && displayedPrescriptions.length === 0 && (
          <div className="text-center py-32 text-gray-400">
            <p className="text-3xl mb-4">No prescriptions found</p>
            <p>Your doctor will add them soon.</p>
          </div>
        )}

        {!loading && !error && displayedPrescriptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {currentPrescriptions.map((pres) => (
                <motion.div
                  key={pres.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 hover:scale-105 transition-all"
                >
                  <h2 className="text-2xl font-bold text-[#67e8f9]">
                    {pres.medicineName || pres.medicationName}
                  </h2>
                  <p className="text-gray-300 mt-2">{pres.instructions}</p>
                  <p className="text-sm text-gray-400 mt-4">
                    Doctor:{" "}
                    <span className="text-[#4addbf]">
                      {pres.doctor?.username || "Dr. Unknown"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Status: {pres.status}
                  </p>

                  <div className="mt-8 flex justify-between items-center">
                    <div
                      className={`w-5 h-5 rounded-full ${
                        refillStatus[pres.id] === "done"
                          ? "bg-green-400"
                          : "bg-yellow-400 animate-pulse"
                      }`}
                    />
                    <button
                      onClick={() => requestPrescription(pres.id)}
                      disabled={refillStatus[pres.id] === "pending"} // only disable if last request is pending
                      className={`px-6 py-3 rounded-full font-bold ${
                        refillStatus[pres.id] === "pending"
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-[#4addbf] hover:bg-[#39c6a5]"
                      } text-gray-900`}
                    >
                      {refillStatus[pres.id] === "pending"
                        ? "Request Pending"
                        : "Request Refill"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-[#4addbf] text-gray-900"
                  : "bg-gray-700 text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ModernPrescriptionGrid;
