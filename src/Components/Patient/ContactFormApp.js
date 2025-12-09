import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Send, Paperclip, Circle } from "lucide-react";
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

// Format relative time like "2 days ago"
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const thresholds = [
    { limit: 60, unit: "second", divisor: 1 },
    { limit: 3600, unit: "minute", divisor: 60 },
    { limit: 86400, unit: "hour", divisor: 3600 },
    { limit: 604800, unit: "day", divisor: 86400 },
    { limit: 2629800, unit: "week", divisor: 604800 },
    { limit: 31557600, unit: "month", divisor: 2629800 },
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const t of thresholds) {
    if (Math.abs(diffSec) < t.limit) {
      const value = Math.round(diffSec / t.divisor);
      return formatter.format(value, t.unit);
    }
  }
  const years = Math.round(diffSec / 31557600);
  return formatter.format(years, "year");
};

const ContactFormApp = () => {
  const [recipientType, setRecipientType] = useState("Doctor");
  const [recipientList, setRecipientList] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [sendError, setSendError] = useState("");
  const [recipientTypeDropdown, setRecipientTypeDropdown] = useState(false);
  const [recipientListDropdown, setRecipientListDropdown] = useState(false);
  const recipientTypeRef = useRef(null);
  const recipientListRef = useRef(null);
  const historyEndRef = useRef(null);

  /** Fetch history */
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/contact-history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err));
  }, []);

  /** Fetch recipients based on type */
  useEffect(() => {
    setRecipientLoading(true);
    setRecipientError("");

    // Map UI recipientType to backend role
    const roleMapping = {
      Doctor: "DOCTOR",
      Lab: "LAB",
      Pharmacy: "PHARMACY",
    };

    axios
      .get("http://localhost:8000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        console.log("Fetched users for recipients:", res.data);
        const users = Array.isArray(res.data) ? res.data : [];
        if (!Array.isArray(res.data)) {
          setRecipientError("Invalid response format. Expected an array.");
          setRecipientList([]);
          return;
        }

        // Group users by role
        const grouped = users.reduce((acc, user) => {
          if (!acc[user.role]) acc[user.role] = [];
          acc[user.role].push(user);
          return acc;
        }, {});

        console.log("Grouped users by role:", grouped);

        // Get the backend role key for the selected recipientType
        const roleKey = roleMapping[recipientType];
        const filteredUsers = grouped[roleKey] || [];

        setRecipientList(filteredUsers);
        console.log(
          `Recipients for type ${recipientType} (${roleKey}):`,
          filteredUsers
        );

        if (filteredUsers.length === 0) {
          setRecipientError(`No ${recipientType}s found.`);
        }
      })
      .catch((err) => {
        console.error("Error fetching recipients:", err);
        setRecipientList([]);

        if (err.response?.status === 403) {
          setRecipientError(
            "Access denied. You may not have permission to view recipients, or your session has expired. Please try logging in again."
          );
        } else if (err.response?.status === 401) {
          setRecipientError("Authentication failed. Please log in again.");
        } else {
          setRecipientError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to fetch recipients."
          );
        }
      })
      .finally(() => setRecipientLoading(false));
  }, [recipientType]);

  /** Scroll history to bottom */
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  /** Close dropdowns when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        recipientTypeRef.current &&
        !recipientTypeRef.current.contains(event.target)
      ) {
        setRecipientTypeDropdown(false);
      }
      if (
        recipientListRef.current &&
        !recipientListRef.current.contains(event.target)
      ) {
        setRecipientListDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Send contact message */
  const handleSend = async () => {
    if (!selectedRecipient || !message.trim()) return;
    setSendError("");

    const token = localStorage.getItem("token");
    const decoded = token ? parseJwt(token) : null;
    const senderId = decoded?.userId ? parseInt(decoded.userId) : null;

    const selectedUser = recipientList.find(
      (r) => r.id === parseInt(selectedRecipient)
    );
    console.log("Sending message to:", selectedUser);
    console.log("Decoded JWT:", decoded);
    console.log("Sender ID:", senderId);

    if (!senderId) {
      setSendError("Unable to determine sender. Please log in again.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/send-contact",
        {
          recipientType,
          recipientId: selectedUser?.id,
          senderId,
          recipientEmail: selectedUser?.email || "",
          recipientName: selectedUser?.username || "",
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistory((prev) => [
        ...prev,
        {
          recipientType,
          recipientName: selectedUser?.username || "Unknown",
          content: message,
          sentAt: new Date().toISOString(),
        },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      if (err.response?.status === 403) {
        setSendError(
          err?.response?.data?.message ||
            "Access denied. You may not have permission to send messages, or your session has expired. Please log in again."
        );
      } else if (err.response?.status === 401) {
        setSendError("Authentication failed. Please log in again.");
      } else {
        setSendError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send message. Please try again."
        );
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Sidebar / History */}
        <aside className="w-80 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Circle size={8} fill="#4addbf" stroke="#4addbf" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent">
              Contact History
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {history.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                No messages yet
              </p>
            ) : (
              history.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/10 hover:border-[#4addbf]/50 transition-all"
                >
                  <p className="text-xs font-semibold text-[#67e8f9] mb-1">
                    {item.recipientType}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                    <span className="font-semibold text-white/90">
                      {item.recipientName || "N/A"}
                    </span>
                    <span>
                      {formatRelativeTime(item.sentAt || item.sent_at)}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2">
                    {item.content}
                  </p>
                </motion.div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#4addbf] to-[#67e8f9] bg-clip-text text-transparent mb-2">
              Send a Message
            </h2>
            <p className="text-white/60">Connect with healthcare providers</p>
          </motion.div>

          <div className="flex flex-col gap-6 max-w-2xl w-full bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Recipient Type Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Recipient Type
              </label>
              <div className="relative" ref={recipientTypeRef}>
                <button
                  onClick={() => {
                    setRecipientTypeDropdown(!recipientTypeDropdown);
                    setRecipientListDropdown(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#4addbf] focus:ring-2 focus:ring-[#4addbf]/50 transition-all text-left"
                >
                  {recipientType}
                </button>
                <AnimatePresence>
                  {recipientTypeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      {["Doctor", "Lab", "Pharmacy"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setRecipientType(type);
                            setRecipientTypeDropdown(false);
                            setSelectedRecipient("");
                          }}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition"
                        >
                          {type}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Recipient Selection Dropdown */}
            <div>
              {recipientLoading ? (
                <p className="text-white/60 text-sm mb-2">
                  Loading recipients...
                </p>
              ) : recipientError ? (
                <p className="text-red-400 text-sm mb-2">{recipientError}</p>
              ) : recipientList.length > 0 ? (
                <div className="relative" ref={recipientListRef}>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Select {recipientType}
                  </label>
                  <button
                    onClick={() => {
                      setRecipientListDropdown(!recipientListDropdown);
                      setRecipientTypeDropdown(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#4addbf] focus:ring-2 focus:ring-[#4addbf]/50 transition-all text-left"
                  >
                    {selectedRecipient
                      ? recipientList.find(
                          (r) => r.id === parseInt(selectedRecipient)
                        )?.username
                      : `Select ${recipientType}`}
                  </button>
                  <AnimatePresence>
                    {recipientListDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                      >
                        {recipientList.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setSelectedRecipient(r.id);
                              setRecipientListDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-cyan-500/20 transition"
                          >
                            {r.username}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your message to ${recipientType}...`}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white resize-none focus:outline-none focus:border-[#4addbf] focus:ring-2 focus:ring-[#4addbf]/50 transition-all h-40 placeholder-white/40"
              />
            </div>

            {/* Error Message */}
            {sendError && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {sendError}
              </div>
            )}

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#4addbf] to-[#67e8f9] hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-black flex items-center justify-center gap-2"
              disabled={!message.trim() || !selectedRecipient}
            >
              <Send size={20} />
              Send Message
            </motion.button>
          </div>
        </main>
      </div>
      {/* make space for footer */}
      <div style={{ height: "100px" }}></div>

      <Footer />
    </div>
  );
};

export default ContactFormApp;
