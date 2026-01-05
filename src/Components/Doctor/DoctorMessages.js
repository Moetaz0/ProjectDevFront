// DoctorMessages.jsx — Dynamic contact form like patient's ContactFormApp
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, ChevronDown, Loader } from "lucide-react";
import axios from "axios";

// Decode JWT payload safely
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
};

const DoctorMessages = () => {
  const navigate = useNavigate();

  // State for recipient type and list
  const [recipientType, setRecipientType] = useState("Client");
  const [recipientList, setRecipientList] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [recipientTypeDropdown, setRecipientTypeDropdown] = useState(false);
  const [recipientListDropdown, setRecipientListDropdown] = useState(false);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);

  // History state
  const [history, setHistory] = useState([]);

  // Refs
  const recipientTypeRef = useRef(null);
  const recipientListRef = useRef(null);

  // Fetch recipients based on type
  useEffect(() => {
    setRecipientLoading(true);

    const roleMapping = {
      Client: "CLIENT",
      Labs: "LABS",
      Pharmacy: "PHARMACY",
    };

    axios
      .get("http://localhost:8000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];

        // Group users by role
        const grouped = users.reduce((acc, user) => {
          if (!acc[user.role]) acc[user.role] = [];
          acc[user.role].push(user);
          return acc;
        }, {});

        const roleKey = roleMapping[recipientType];
        const filteredUsers = grouped[roleKey] || [];

        setRecipientList(filteredUsers);
        setSelectedRecipient(null);
      })
      .catch((err) => {
        console.error("Error fetching recipients:", err);
        setRecipientList([]);
      })
      .finally(() => setRecipientLoading(false));
  }, [recipientType]);

  // Fetch email history
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/contact-history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        recipientTypeRef.current &&
        !recipientTypeRef.current.contains(e.target)
      ) {
        setRecipientTypeDropdown(false);
      }
      if (
        recipientListRef.current &&
        !recipientListRef.current.contains(e.target)
      ) {
        setRecipientListDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !message.trim()) {
      setSendError("Please fill in all fields");
      return;
    }

    setSendError("");
    setSendSuccess("");
    setIsSending(true);

    const token = localStorage.getItem("token");
    const decoded = token ? parseJwt(token) : null;
    const senderId = decoded?.userId ? parseInt(decoded.userId) : null;

    if (!senderId) {
      setSendError("Unable to determine sender. Please log in again.");
      setIsSending(false);
      return;
    }

    const selectedUser = recipientList.find(
      (r) => r.id === parseInt(selectedRecipient)
    );

    try {
      let requestData;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      requestData = {
        recipientType,
        recipientId: selectedUser?.id,
        senderId,
        recipientEmail: selectedUser?.email || "",
        recipientName: selectedUser?.username || "",
        content: `Subject: ${subject}\n\n${message}`,
      };

      await axios.post("http://localhost:8000/api/send-contact", requestData, {
        headers,
      });

      setSendSuccess("Email sent successfully!");
      setHistory((prev) => [
        ...prev,
        {
          recipientType,
          recipientName: selectedUser?.username || "Unknown",
          recipientId: selectedUser?.id,
          senderId: senderId,
          content: message,
          subject: subject,
          sentAt: new Date().toISOString(),
        },
      ]);
      setSubject("");
      setMessage("");
      setSelectedRecipient("");

      setTimeout(() => setSendSuccess(""), 3000);
    } catch (err) {
      console.error("Error sending email:", err);
      if (err.response?.status === 403) {
        setSendError(
          err?.response?.data?.message ||
            "Access denied. You may not have permission to send emails."
        );
      } else if (err.response?.status === 401) {
        setSendError("Authentication failed. Please log in again.");
      } else {
        setSendError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send email. Please try again."
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white overflow-hidden">
      {/* HEADER */}
      <div className="bg-black/50 backdrop-blur-2xl border-b border-white/10 px-8 py-5 flex items-center gap-4">
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
          Send Email
        </h1>
      </div>

      {/* MAIN CONTENT WITH SIDEBAR */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* HISTORY SIDEBAR */}
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-80 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col"
        >
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Email History</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No emails sent yet
              </div>
            ) : (
              history.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.recipientName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {item.recipientType}
                      </p>

                      {item.attachments && item.attachments.length > 0 && (
                        <p className="text-xs text-[#4addbf] mt-1">
                          📎 {item.attachments.length} file(s)
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.sentAt).toLocaleDateString()} at{" "}
                    {new Date(item.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* MAIN FORM CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendEmail} className="space-y-6">
              {/* Recipient Type Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  To (Type)
                </label>
                <div className="relative" ref={recipientTypeRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipientTypeDropdown(!recipientTypeDropdown)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-left"
                  >
                    <span className="font-medium">{recipientType}</span>
                    <ChevronDown size={20} />
                  </button>

                  <AnimatePresence>
                    {recipientTypeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50"
                      >
                        {["Client", "Labs", "Pharmacy"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setRecipientType(type);
                              setRecipientTypeDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-white/10 transition ${
                              type === recipientType
                                ? "bg-[#4addbf]/20 text-[#4addbf]"
                                : ""
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Recipient Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient
                </label>
                <div className="relative" ref={recipientListRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipientListDropdown(!recipientListDropdown)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 text-left"
                  >
                    <span className="font-medium">
                      {selectedRecipient
                        ? recipientList.find(
                            (r) => r.id === parseInt(selectedRecipient)
                          )?.username ||
                          recipientList.find(
                            (r) => r.id === parseInt(selectedRecipient)
                          )?.fullName ||
                          "Select recipient"
                        : `Select ${recipientType}`}
                    </span>
                    {recipientLoading ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  <AnimatePresence>
                    {recipientListDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50"
                      >
                        {recipientList.length === 0 ? (
                          <div className="px-4 py-3 text-gray-400">
                            No {recipientType.toLowerCase()}s found
                          </div>
                        ) : (
                          recipientList.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedRecipient(user.id.toString());
                                setRecipientListDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-white/10 transition ${
                                selectedRecipient === user.id.toString()
                                  ? "bg-[#4addbf]/20 text-[#4addbf]"
                                  : ""
                              }`}
                            >
                              {user.username || user.fullName || "Unknown"}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows="10"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 focus:outline-none focus:border-[#4addbf] focus:ring-4 focus:ring-[#4addbf]/30 transition-all resize-none"
                />
              </div>

              {/* Error Message */}
              {sendError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-200"
                >
                  {sendError}
                </motion.div>
              )}
              {sendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/20 border border-green-500 text-green-200"
                >
                  {sendSuccess}
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSending || !selectedRecipient}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4addbf] to-[#67e8f9] text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition shadow-2xl flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Email
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubject("");
                    setMessage("");
                    setSelectedRecipient("");
                    setSendError("");
                  }}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
