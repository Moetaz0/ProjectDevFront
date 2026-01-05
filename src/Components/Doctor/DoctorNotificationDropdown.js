import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/api";
import { MdClose } from "react-icons/md";
import {
  FiCheck,
  FiCheckCircle,
  FiCalendar,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiBell,
} from "react-icons/fi";
import { GiPill } from "react-icons/gi";
import { FaFlask } from "react-icons/fa";

const DoctorNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  let doctorId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      doctorId =
        decoded.userId || decoded.id || decoded.sub || decoded.doctorId;
    } catch (err) {
      console.error("Invalid token");
    }
  }

  // Fetch notifications (moved below after function declarations)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(doctorId);
      if (Array.isArray(data)) {
        const sorted = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setNotifications(sorted);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!doctorId) return;
    try {
      const count = await getUnreadCount(doctorId);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [doctorId]);

  // Fetch notifications
  useEffect(() => {
    if (doctorId) {
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [doctorId, fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
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
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Navigate based on notification type
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        // Optimistically mark as read
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        await markNotificationAsRead(notification.id);
        fetchUnreadCount();
      }

      // Route navigation by type
      switch (notification?.type) {
        case "APPOINTMENT_REQUESTED":
          // Navigate to doctor's appointments page
          navigate("/doctor/appointments", {
            state: {
              fromNotification: true,
              appointmentId: notification?.appointmentId || null,
            },
          });
          break;
        case "APPOINTMENT_ACCEPTED":
        case "APPOINTMENT_REMINDER_3_DAYS":
        case "APPOINTMENT_REMINDER_1_DAY":
          navigate("/doctor/appointments");
          break;
        case "PRESCRIPTION_ADDED":
          navigate("/doctor/prescriptions");
          break;
        default:
          // Fallback to notifications page
          navigate("/doctor/notifications");
          break;
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20 };
    const icons = {
      PRESCRIPTION_ADDED: <GiPill {...iconProps} className="text-purple-400" />,
      APPOINTMENT_ACCEPTED: (
        <FiCheckCircle {...iconProps} className="text-green-400" />
      ),
      APPOINTMENT_REQUESTED: (
        <FiCalendar {...iconProps} className="text-indigo-400" />
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

  const getTypeLabel = (type) => {
    const typeMap = {
      PRESCRIPTION_ADDED: "Prescription Added",
      APPOINTMENT_ACCEPTED: "Appointment Confirmed",
      APPOINTMENT_REQUESTED: "New Appointment Request",
      APPOINTMENT_REMINDER_3_DAYS: "Appointment - 3 Days",
      APPOINTMENT_REMINDER_1_DAY: "Appointment - 1 Day",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setDisplayCount(10);
        }}
        className="text-gray-700 hover:text-[#4addbf] relative transition"
      >
        <span className="relative">
          <FiBell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1.5 rounded-full font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4addbf]/20 to-[#4addbf]/10 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-gray-900 font-semibold flex items-center space-x-2">
                <FiBell size={20} className="text-[#4addbf]" />
                <span>Notifications</span>
              </h3>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#4addbf] hover:text-[#39c6a5] flex items-center space-x-1 transition font-semibold"
                >
                  <FiCheckCircle size={16} />
                  <span>Mark all read</span>
                </motion.button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="flex justify-center mb-2">
                    <div className="animate-spin h-5 w-5 text-[#4addbf]"></div>
                  </div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="text-3xl mb-2">😴</div>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.slice(0, displayCount).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition cursor-pointer group ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold text-sm ${
                              notification.read
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                              className="p-1 text-[#4addbf] hover:bg-[#4addbf]/10 rounded transition"
                              title="Mark as read"
                            >
                              <FiCheck size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) =>
                              handleDeleteNotification(notification.id, e)
                            }
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <MdClose size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                {displayCount < notifications.length && (
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 5)}
                    className="text-xs text-[#4addbf] hover:text-[#39c6a5] font-semibold transition"
                  >
                    Load More
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate("/doctor/notifications");
                    setIsOpen(false);
                  }}
                  className="text-xs text-[#4addbf] hover:text-[#39c6a5] font-semibold transition ml-auto"
                >
                  View all →
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorNotificationDropdown;
