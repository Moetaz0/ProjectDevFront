import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { LanguageContext } from "../../context/LanguageContext";
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
} from "react-icons/fi";
import { GiPill } from "react-icons/gi";
import { FaFlask } from "react-icons/fa";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SuccessToast from "../SuccessToast";
import ErrorToast from "../ErrorToast";

const NotificationsPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [successToast, setSuccessToast] = useState({
    show: false,
    message: "",
  });
  const [errorToast, setErrorToast] = useState({ show: false, message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch all notifications
  useEffect(() => {
    if (user?.userId) {
      fetchAllNotifications();
      fetchUnreadCount();
    }
  }, [user?.userId]);

  const fetchAllNotifications = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(user.userId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const count = await getUnreadCount(user.userId);
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
      setSuccessToast({ show: true, message: "✓ Marked as read" });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setErrorToast({ show: true, message: "✗ Failed to mark as read" });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      fetchUnreadCount();
      setSuccessToast({ show: true, message: "✓ Notification deleted" });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setErrorToast({ show: true, message: "✗ Failed to delete notification" });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;
    try {
      await markAllNotificationsAsRead(user.userId);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      setSuccessToast({
        show: true,
        message: "✓ All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      setErrorToast({ show: true, message: "✗ Failed to mark all as read" });
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
      setSuccessToast({ show: true, message: "✓ All notifications cleared" });
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      setErrorToast({ show: true, message: "✗ Failed to clear notifications" });
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

  // Reset pagination when filters change
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Pagination
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
      info: <FiInfo {...iconProps} className="text-cyan-400" />,
    };
    return icons[type] || <FiInfo {...iconProps} className="text-cyan-400" />;
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1a2a4a] to-[#0f172a] text-white py-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
                  <FiCheckCircle size={40} className="text-cyan-400" />
                  Notifications
                </h1>
                <p className="text-gray-400 text-lg">
                  Stay updated with your medical appointments and prescriptions
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-sm"
              >
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">
                  {notifications.length}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-400/20 rounded-xl p-4 backdrop-blur-sm"
              >
                <p className="text-gray-400 text-sm">Unread</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">
                  {unreadCount}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-400/20 rounded-xl p-4 backdrop-blur-sm"
              >
                <p className="text-gray-400 text-sm">Showing</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {filteredNotifications.length}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
              <input
                type="text"
                placeholder="Search by title or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full px-5 py-3 bg-[#1a2a4a]/50 border border-cyan-400/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition"
              />
              <FiFilter
                size={18}
                className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Filter by Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a2a4a]/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition hover:bg-[#1a2a4a]/70"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a2a4a]/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition hover:bg-[#1a2a4a]/70"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="unread">Unread First</option>
                </select>
              </div>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2.5 mt-6 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 hover:border-cyan-400/80 rounded-lg text-cyan-300 hover:text-cyan-200 transition font-semibold flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <FiCheckCircle size={16} />
                  Mark All Read
                </motion.button>
              )}

              {/* Clear All Button */}
              {notifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2.5 mt-6 bg-gradient-to-r from-red-600/30 to-rose-600/30 border border-red-400/50 hover:border-red-400/80 rounded-lg text-red-300 hover:text-red-200 transition font-semibold flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <MdDelete size={16} />
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Notifications List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <FiCheckCircle size={48} className="text-cyan-400" />
                </motion.div>
                <p className="text-gray-400 text-lg">
                  Loading your notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-[#1a2a4a]/50 to-[#0f172a]/50 border border-cyan-400/10 rounded-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-7xl mb-6"
                >
                  📭
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "You're all caught up! No new notifications"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className={`group bg-gradient-to-r border rounded-xl p-5 transition-all cursor-pointer backdrop-blur-sm ${
                      notification.read
                        ? "from-[#1a2a4a]/40 to-[#1a3a5a]/30 border-cyan-400/10 hover:border-cyan-400/30"
                        : "from-cyan-600/10 to-blue-600/10 border-cyan-400/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex-shrink-0 text-4xl p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg"
                      >
                        {getNotificationIcon(notification.type)}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-lg mb-1 ${
                                notification.read
                                  ? "text-gray-400"
                                  : "text-white group-hover:text-cyan-200"
                              } transition`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="p-2 text-cyan-400 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400/30 rounded-lg transition"
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
                              className="p-2 text-red-400 bg-red-600/20 hover:bg-red-600/40 border border-red-400/30 rounded-lg transition"
                              title="Delete"
                            >
                              <MdClose size={18} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 flex-wrap mt-3">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold bg-cyan-600/20 border border-cyan-400/30 text-cyan-300 rounded-full">
                            {getTypeLabel(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="px-3 py-1 text-xs font-semibold bg-amber-600/20 border border-amber-400/30 text-amber-300 rounded-full animate-pulse">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pagination Controls */}
          {filteredNotifications.length > itemsPerPage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="flex items-center justify-center gap-2 mt-10"
            >
              {/* Previous Button */}
              <motion.button
                whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg transition font-semibold flex items-center gap-2 ${
                  currentPage === 1
                    ? "bg-gray-700/30 border-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-cyan-600/20 border-cyan-400/50 text-cyan-300 hover:border-cyan-400/80 hover:text-cyan-200"
                }`}
              >
                ← Previous
              </motion.button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and adjacent pages
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
                              ? "bg-cyan-600/40 border-cyan-400/80 text-cyan-200"
                              : "bg-cyan-600/20 border-cyan-400/30 text-cyan-300 hover:border-cyan-400/60"
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
                  }
                )}
              </div>

              {/* Next Button */}
              <motion.button
                whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
                whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg transition font-semibold flex items-center gap-2 ${
                  currentPage === totalPages
                    ? "bg-gray-700/30 border-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-cyan-600/20 border-cyan-400/50 text-cyan-300 hover:border-cyan-400/80 hover:text-cyan-200"
                }`}
              >
                Next →
              </motion.button>

              {/* Page Info */}
              <div className="text-gray-400 text-sm ml-4 px-4 py-2 bg-cyan-600/10 border border-cyan-400/20 rounded-lg">
                Page {currentPage} of {totalPages}
              </div>
            </motion.div>
          )}

          {/* Footer Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10 p-5 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-400/20 rounded-xl text-center"
          >
            <p className="text-gray-400 text-sm">
              💡 <span className="text-cyan-400 font-semibold">Tip:</span>{" "}
              Notifications are automatically synced across all your devices
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />

      {/* Success Toast */}
      <SuccessToast
        show={successToast.show}
        message={successToast.message}
        onClose={() => setSuccessToast({ show: false, message: "" })}
      />

      {/* Error Toast */}
      <ErrorToast
        show={errorToast.show}
        message={errorToast.message}
        onClose={() => setErrorToast({ show: false, message: "" })}
      />

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
              className="bg-[#121826] border border-red-400/30 rounded-lg p-6 w-96 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Delete All Notifications?
              </h3>
              <p className="text-gray-400 mb-6">
                This action cannot be undone. All {notifications.length}{" "}
                notification(s) will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-600/20 border border-red-400/30 hover:bg-red-600/30 text-red-400 rounded-lg transition font-medium"
                >
                  <MdDelete size={16} className="inline mr-1" />
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationsPage;
