// UploadReport.jsx — FINAL: No double arrows EVER
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  Calendar,
  FileSignature,
} from "lucide-react";
import {
  createLabResultWithFile,
  searchPatientsByName,
  searchDoctorsByName,
  searchLabsByName,
  getAllUsers,
  getAllDoctors,
  getAllLabs,
  getMedicalHistoryByUserId,
} from "../../services/api";
import { getUserFromToken } from "../../utils/jwt";

const UploadReport = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    testName: "",
    date: "",
    clientId: "",
    doctorId: "",
    labId: "",
    medicalHistoryId: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [names, setNames] = useState({ client: "", doctor: "", lab: "" });
  const [queries, setQueries] = useState({ client: "", doctor: "", lab: "" });
  const [options, setOptions] = useState({ client: [], doctor: [], lab: [] });
  const [allData, setAllData] = useState({ client: [], doctor: [], lab: [] });
  const [lookupLoading, setLookupLoading] = useState({
    client: false,
    doctor: false,
    lab: false,
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [labLocked, setLabLocked] = useState(false);
  const [labPlaceholder, setLabPlaceholder] = useState("Loading your lab...");

  // Capture logged-in user id and set initial lab info from token
  useEffect(() => {
    const tokenUser = getUserFromToken();
    if (tokenUser?.userId) {
      setCurrentUserId(tokenUser.userId);
      // Set initial lab name from token if available
      const initialLabName =
        tokenUser.username || tokenUser.name || tokenUser.labName || "Your Lab";
      setNames((prev) => ({ ...prev, lab: initialLabName }));
      setQueries((prev) => ({ ...prev, lab: initialLabName }));
      setLabPlaceholder(initialLabName);
    }
  }, []);

  // When labs are loaded, lock to logged-in lab and show its name
  useEffect(() => {
    if (labLocked || !currentUserId || !allData.lab?.length) return;
    const matchedLab = allData.lab.find(
      (lab) => lab.user?.id === currentUserId
    );
    if (matchedLab) {
      const labName = matchedLab.name || "";
      setForm((prev) => ({ ...prev, labId: matchedLab.id }));
      setNames((prev) => ({ ...prev, lab: labName }));
      setQueries((prev) => ({ ...prev, lab: labName }));
      setLabLocked(true);
      setLabPlaceholder(labName || "Your lab");
      setOptions((prev) => ({ ...prev, lab: [] }));
    }
  }, [currentUserId, allData.lab, labLocked]);

  // Auto-fetch medical history ID when client is selected
  useEffect(() => {
    if (!form.clientId) {
      setForm((prev) => ({ ...prev, medicalHistoryId: "" }));
      return;
    }
    let active = true;
    getMedicalHistoryByUserId(form.clientId)
      .then((history) => {
        if (active && history?.id) {
          setForm((prev) => ({ ...prev, medicalHistoryId: history.id }));
        }
      })
      .catch(() => {
        // Silently ignore if no medical history found
        if (active) {
          setForm((prev) => ({ ...prev, medicalHistoryId: "" }));
        }
      });
    return () => {
      active = false;
    };
  }, [form.clientId]);

  // Bootstrap: load all entities once, then search locally
  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      try {
        const tokenUser = getUserFromToken();
        const [patientsRes, doctorsRes, labsRes] = await Promise.all([
          getAllUsers().catch(() => []),
          getAllDoctors().catch(() => []),
          getAllLabs().catch(() => []),
        ]);
        console.log("Preloaded data:", { patientsRes, doctorsRes, labsRes });
        if (!active) return;
        setAllData({
          client: Array.isArray(patientsRes) ? patientsRes : [],
          doctor: Array.isArray(doctorsRes) ? doctorsRes : [],
          lab: Array.isArray(labsRes) ? labsRes : [],
        });
        // Preselect lab matching logged-in user if present
        const matchedLab = (Array.isArray(labsRes) ? labsRes : []).find(
          (lab) => lab.user?.id === tokenUser?.userId
        );
        if (matchedLab) {
          const labName = matchedLab.name || "";
          setForm((prev) => ({
            ...prev,
            labId: matchedLab.id,
          }));
          setNames((prev) => ({ ...prev, lab: labName }));
          setQueries((prev) => ({ ...prev, lab: labName }));
          setLabLocked(true);
          setLabPlaceholder(labName || "Your lab");
        } else if (tokenUser?.userId) {
          // If no match found in labs data, still lock with token data
          setForm((prev) => ({ ...prev, labId: tokenUser.userId }));
          setLabLocked(true);
        }
      } catch (err) {
        // Quietly ignore; fallback to API search per keystroke
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus({ type: "", message: "" });
    }
  };

  // Debounced search by name
  useEffect(() => {
    const timers = [];

    const localSearch = (type, query) => {
      const haystack = allData[type] || [];
      const q = query.toLowerCase();
      return haystack
        .filter((item) => {
          let name = "";
          if (type === "doctor") {
            name = item.user?.username || "";
          } else if (type === "lab") {
            name = item.name || "";
          } else {
            name = item.username || item.name || item.fullName || "";
          }
          return name.toLowerCase().includes(q);
        })
        .map((item) => {
          let name = "";
          if (type === "doctor") {
            name = item.user?.username || "";
          } else if (type === "lab") {
            name = item.name || "";
          } else {
            name = item.username || item.name || item.fullName || "";
          }
          return {
            id: item.id || item.userId || item._id,
            name: name,
          };
        })
        .slice(0, 10);
    };

    const runSearch = (type, rawQuery, searchFn) => {
      const query = rawQuery.trim();
      if (type === "lab" && labLocked) {
        setOptions((prev) => ({ ...prev, lab: [] }));
        return;
      }
      if (!query) {
        setOptions((prev) => ({ ...prev, [type]: [] }));
        setLookupLoading((prev) => ({ ...prev, [type]: false }));
        setForm((prev) => ({ ...prev, [`${type}Id`]: "" }));
        setNames((prev) => ({ ...prev, [type]: "" }));
        return;
      }
      const local = localSearch(type, query);
      if (local.length > 0) {
        setOptions((prev) => ({ ...prev, [type]: local }));
        setLookupLoading((prev) => ({ ...prev, [type]: false }));
        return;
      }
      setLookupLoading((prev) => ({ ...prev, [type]: true }));
      searchFn(query)
        .then((res) => {
          const mapped = Array.isArray(res)
            ? res.map((item) => {
                let name = "";
                if (type === "doctor") {
                  name = item.user?.username || "";
                } else if (type === "lab") {
                  name = item.name || "";
                } else {
                  name = item.username || item.name || item.fullName || "";
                }
                return {
                  id: item.id || item.userId || item._id,
                  name: name,
                };
              })
            : [];
          setOptions((prev) => ({ ...prev, [type]: mapped }));
        })
        .catch(() => {
          setOptions((prev) => ({ ...prev, [type]: [] }));
        })
        .finally(() => {
          setLookupLoading((prev) => ({ ...prev, [type]: false }));
        });
    };

    timers.push(setTimeout(() => runSearch("client", queries.client), 200));
    timers.push(setTimeout(() => runSearch("doctor", queries.doctor), 200));
    timers.push(setTimeout(() => runSearch("lab", queries.lab), 200));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [queries]);

  const selectOption = (type, option) => {
    setForm((prev) => ({ ...prev, [`${type}Id`]: option.id }));
    setNames((prev) => ({ ...prev, [type]: option.name }));
    setQueries((prev) => ({ ...prev, [type]: option.name }));
    setOptions((prev) => ({ ...prev, [type]: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!file) {
      setStatus({ type: "error", message: "Please select a report file." });
      return;
    }
    if (!form.testName || !form.clientId || !form.doctorId || !form.labId) {
      setStatus({
        type: "error",
        message: "Test name, client, doctor, and lab are required.",
      });
      return;
    }

    try {
      setLoading(true);
      await createLabResultWithFile({
        file,
        testName: form.testName,
        date: form.date,
        clientId: form.clientId,
        doctorId: form.doctorId,
        labId: form.labId,
        medicalHistoryId: form.medicalHistoryId || undefined,
      });
      setStatus({ type: "success", message: "Report uploaded successfully." });
      setForm({
        testName: "",
        date: "",
        clientId: "",
        doctorId: "",
        labId: "",
        medicalHistoryId: "",
      });
      setNames({ client: "", doctor: "", lab: "" });
      setQueries({ client: "", doctor: "", lab: "" });
      setOptions({ client: [], doctor: [], lab: [] });
      setFile(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Upload failed. Please check the details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-y-auto">
      {/* HEADER */}
      <header className="bg-black/50 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/lab-dashboard")}
              className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              Upload Report
            </h1>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto space-y-12 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-3">Send Lab Report to Doctor</h2>
          <p className="text-gray-300 text-lg">
            Fill in patient details and upload the test report securely
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <FileSignature size={18} /> Test Name
                </label>
                <input
                  type="text"
                  value={form.testName}
                  onChange={(e) => handleChange("testName", e.target.value)}
                  placeholder="e.g. CBC, Lipid Profile"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <Calendar size={18} /> Date (optional)
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-gray-300 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <User size={18} /> Client Name
                </label>
                <input
                  type="text"
                  value={queries.client}
                  onChange={(e) =>
                    setQueries((prev) => ({ ...prev, client: e.target.value }))
                  }
                  placeholder="Search patient by name"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                />
                {lookupLoading.client && (
                  <p className="text-sm text-gray-400">Searching...</p>
                )}
                {options.client.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
                    {options.client.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => selectOption("client", opt)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{opt.name}</span>
                        <span className="text-xs text-gray-400">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <Stethoscope size={18} /> Doctor Name
                </label>
                <input
                  type="text"
                  value={queries.doctor}
                  onChange={(e) =>
                    setQueries((prev) => ({ ...prev, doctor: e.target.value }))
                  }
                  placeholder="Search doctor by name"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                />
                {lookupLoading.doctor && (
                  <p className="text-sm text-gray-400">Searching...</p>
                )}
                {options.doctor.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
                    {options.doctor.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => selectOption("doctor", opt)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{opt.name}</span>
                        <span className="text-xs text-gray-400">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <AlertCircle size={18} /> Lab Name
                </label>
                <input
                  type="text"
                  value={queries.lab}
                  onChange={(e) =>
                    setQueries((prev) => ({ ...prev, lab: e.target.value }))
                  }
                  placeholder={
                    labLocked ? labPlaceholder : "Search lab by name"
                  }
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  disabled={labLocked}
                  readOnly={labLocked}
                />

                {lookupLoading.lab && (
                  <p className="text-sm text-gray-400">Searching...</p>
                )}
                {!labLocked && options.lab.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
                    {options.lab.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => selectOption("lab", opt)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{opt.name}</span>
                        <span className="text-xs text-gray-400">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-gray-300 font-medium flex items-center gap-2">
                  <FileText size={18} /> Medical History ID (auto-populated)
                </label>
                <input
                  type="text"
                  value={form.medicalHistoryId}
                  onChange={(e) =>
                    handleChange("medicalHistoryId", e.target.value)
                  }
                  placeholder="Auto-populated from patient"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all"
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* FILE UPLOAD */}
            <div className="space-y-4">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Upload size={22} /> Upload Report (PDF, Word, or Image)
              </label>
              <label className="block border-2 border-dashed border-white/20 rounded-3xl p-10 text-center hover:border-[#4addbf] hover:bg-white/5 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload
                  size={64}
                  className="mx-auto text-[#67e8f9] mb-4 opacity-80"
                />
                <p className="text-lg font-medium">
                  {file ? file.name : "Drag & drop or click to browse"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  PDF, DOC, DOCX, JPG, PNG
                </p>
              </label>
            </div>

            {status.message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm border ${
                  status.type === "success"
                    ? "bg-green-500/10 border-green-500/40 text-green-200"
                    : "bg-red-500/10 border-red-500/40 text-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-6 pt-4">
              <button
                type="button"
                onClick={() => navigate("/lab-dashboard")}
                className="px-10 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload size={24} /> {loading ? "Uploading..." : "Send Report"}
              </button>
            </div>
          </form>
        </motion.section>
      </div>

      {/* CRITICAL CSS — Add this to your index.css or App.css */}
      <style jsx>{`
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        select::-ms-expand {
          display: none;
        }
        /* Force hide native arrow on all browsers */
        select {
          background-image: none !important;
        }
      `}</style>
    </div>
  );
};

export default UploadReport;
