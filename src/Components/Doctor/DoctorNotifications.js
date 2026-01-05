import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/api";
import { MdClose, MdDelete } from "react-icons/md";
import {
  FiCheck,
  FiCheckCircle,
  FiFilter,
  FiCalendar,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
} from "react-icons/fi";
import { GiPill } from "react-icons/gi";
import { FaFlask } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const DoctorNotifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  let doctorId = null;
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || user?.username;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      doctorId =
        decoded.userId || decoded.id || decoded.sub || decoded.doctorId;
    } catch (err) {
      console.error("Invalid token");
    }
  }

  // Fetch notifications
  useEffect(() => {
    if (doctorId) {
      fetchAllNotifications();
      fetchUnreadCount();
    }
  }, [doctorId]);

  const fetchAllNotifications = async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(doctorId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!doctorId) return;
    try {
      const count = await getUnreadCount(doctorId);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      fetchUnreadCount();
      setSuccessMessage("Marked as read");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setErrorMessage("Failed to mark as read");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      fetchUnreadCount();
      setSuccessMessage("Notification deleted");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setErrorMessage("Failed to delete notification");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!doctorId) return;
    try {
      await markAllNotificationsAsRead(doctorId);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      setSuccessMessage("All notifications marked as read");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      setErrorMessage("Failed to mark all as read");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        notifications.map((notif) => deleteNotification(notif.id))
      );
      setNotifications([]);
      setDeleteConfirm(false);
      setCurrentPage(1);
      fetchUnreadCount();
      setSuccessMessage("All notifications cleared");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      setErrorMessage("Failed to clear notifications");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Filter notifications
  let filteredNotifications = notifications;

  if (selectedType !== "all") {
    filteredNotifications = filteredNotifications.filter(
      (n) => n.type === selectedType
    );
  }

  if (searchQuery.trim()) {
    filteredNotifications = filteredNotifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort notifications
  if (sortBy === "newest") {
    filteredNotifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortBy === "oldest") {
    filteredNotifications.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (sortBy === "unread") {
    filteredNotifications.sort((a, b) => (b.read ? 1 : -1));
  }

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  );

  const getNotificationIcon = (type) => {
    const iconProps = { size: 28 };
    const icons = {
      PRESCRIPTION_ADDED: <GiPill {...iconProps} className="text-purple-400" />,
      APPOINTMENT_ACCEPTED: (
        <FiCheckCircle {...iconProps} className="text-green-400" />
      ),
      APPOINTMENT_REMINDER_3_DAYS: (
        <FiCalendar {...iconProps} className="text-blue-400" />
      ),
      APPOINTMENT_REMINDER_1_DAY: (
        <FiAlertCircle {...iconProps} className="text-orange-400" />
      ),
      appointment: <FiCalendar {...iconProps} className="text-blue-400" />,
      prescription: <GiPill {...iconProps} className="text-purple-400" />,
      message: <FiMessageCircle {...iconProps} className="text-green-400" />,
      result: <FaFlask {...iconProps} className="text-orange-400" />,
      alert: <FiAlertCircle {...iconProps} className="text-red-400" />,
      info: <FiInfo {...iconProps} className="text-[#4addbf]" />,
    };
    return icons[type] || <FiInfo {...iconProps} className="text-[#4addbf]" />;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const notificationTypes = [
    { value: "all", label: "All Notifications" },
    { value: "PRESCRIPTION_ADDED", label: "Prescription Added" },
    { value: "APPOINTMENT_ACCEPTED", label: "Appointment Confirmed" },
    { value: "APPOINTMENT_REMINDER_3_DAYS", label: "Appointment - 3 Days" },
    { value: "APPOINTMENT_REMINDER_1_DAY", label: "Appointment - 1 Day" },
  ];

  const getTypeLabel = (type) => {
    const label = notificationTypes.find((t) => t.value === type);
    return label ? label.label : type;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
                Dr. {username || "Doctor"}
              </h3>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-white/10 transition-all"
          >
            <FiCheckCircle size={22} />
            <span className="flex-1 text-left">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-[#4addbf] text-black font-medium shadow-lg transition-all">
            <FiBell size={22} />
            <span className="flex-1 text-left">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-white/30 px-3 py-1 rounded-full text-sm">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <FiMenu size={28} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                Notifications
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 w-96 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                />
              </div>
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

        {/* Content */}
        <div className="p-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
            >
              ✓ {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              ✗ {errorMessage}
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total</p>
                  <p className="text-4xl font-bold mt-2">
                    {notifications.length}
                  </p>
                </div>
                <FiBell size={48} className="opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Unread</p>
                  <p className="text-4xl font-bold mt-2">{unreadCount}</p>
                </div>
                <FiAlertCircle size={48} className="opacity-80" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Showing</p>
                  <p className="text-4xl font-bold mt-2">
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredNotifications.length)} of{" "}
                    {filteredNotifications.length}
                  </p>
                </div>
                <FiCheckCircle size={48} className="opacity-80" />
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4addbf]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="unread">Unread First</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-3">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllAsRead}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4addbf] to-[#39c6a5] text-black font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    <FiCheckCircle size={16} className="inline mr-2" />
                    Mark All Read
                  </motion.button>
                )}
                {notifications.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteConfirm(true)}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    <MdDelete size={16} className="inline mr-2" />
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-block animate-spin mb-4">
                  <FiCheckCircle size={32} />
                </div>
                <p>Loading notifications...</p>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-lg">
                  {searchQuery
                    ? "No notifications match your search"
                    : "No notifications"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-6 hover:bg-gray-50 transition ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-4xl p-3 bg-gray-100 rounded-lg">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-lg ${
                                notification.read
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                {getTypeLabel(notification.type)}
                              </span>
                              {!notification.read && (
                                <span className="px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                                  Unread
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="p-2 text-[#4addbf] bg-[#4addbf]/10 hover:bg-[#4addbf]/20 rounded-lg transition"
                                title="Mark as read"
                              >
                                <FiCheck size={18} />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                              title="Delete"
                            >
                              <MdClose size={18} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > itemsPerPage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-10"
            >
              <motion.button
                whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg transition font-semibold flex items-center gap-2 ${
                  currentPage === 1
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white border-[#4addbf] text-[#4addbf] hover:bg-blue-50"
                }`}
              >
                ← Previous
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from(
                  {
                    length: Math.ceil(
                      filteredNotifications.length / itemsPerPage
                    ),
                  },
                  (_, i) => i + 1
                ).map((page) => {
                  const totalPages = Math.ceil(
                    filteredNotifications.length / itemsPerPage
                  );
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg border transition font-semibold flex items-center justify-center ${
                          currentPage === page
                            ? "bg-[#4addbf] border-[#4addbf] text-black"
                            : "bg-white border-gray-300 text-gray-600 hover:border-[#4addbf]"
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  } else if (
                    (page === currentPage - 2 && page > 1) ||
                    (page === currentPage + 2 && page < totalPages)
                  ) {
                    return (
                      <span key={page} className="text-gray-500 px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <motion.button
                whileHover={
                  currentPage <
                  Math.ceil(filteredNotifications.length / itemsPerPage)
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  currentPage <
                  Math.ceil(filteredNotifications.length / itemsPerPage)
                    ? { scale: 0.95 }
                    : {}
                }
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      Math.ceil(filteredNotifications.length / itemsPerPage),
                      prev + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredNotifications.length / itemsPerPage)
                }
                className={`px-4 py-2 border rounded-lg transition font-semibold flex items-center gap-2 ${
                  currentPage ===
                  Math.ceil(filteredNotifications.length / itemsPerPage)
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white border-[#4addbf] text-[#4addbf] hover:bg-blue-50"
                }`}
              >
                Next →
              </motion.button>

              <div className="text-gray-600 text-sm ml-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                Page {currentPage} of{" "}
                {Math.ceil(filteredNotifications.length / itemsPerPage)}
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center text-blue-800"
          >
            <p className="font-semibold">
              💡 Stay informed about your appointments, prescriptions, and
              patient updates
            </p>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={() => setDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 w-96 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete All Notifications?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All {notifications.length}{" "}
                notification(s) will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                >
                  <MdDelete size={16} className="inline mr-1" />
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorNotifications;
