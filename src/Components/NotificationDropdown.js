import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/api";
import { MdClose } from "react-icons/md";
import {
  FiCheck,
  FiCheckCircle,
  FiCalendar,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
} from "react-icons/fi";
import { GiPill } from "react-icons/gi";
import { FaFlask } from "react-icons/fa";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10); // Start with 5 notifications
  const dropdownRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
      fetchUnreadCount();
      // Set up polling to check for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

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

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await getUserNotifications(user.userId);
      if (Array.isArray(data)) {
        // Sort by newest first and limit to 10
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
    if (!user?.userId) return;
    try {
      await markAllNotificationsAsRead(user.userId);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20 };
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setDisplayCount(5); // Reset pagination when opening
        }}
        className="text-gray-300 hover:text-cyan-400 relative transition"
      >
        <span className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0"
            />
          </svg>

          {/* Unread notification badge */}
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
            className="absolute right-0 mt-2 w-96 bg-[#121826] border border-cyan-400/20 rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-cyan-500/10 px-4 py-4 border-b border-cyan-400/20 flex justify-between items-center gap-3">
              <h3 className="text-white font-bold flex items-center space-x-2 text-lg">
                <FiCheckCircle size={22} className="text-cyan-400" />
                <span>Notifications</span>
              </h3>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/50 hover:border-cyan-400/80 text-cyan-300 hover:text-cyan-200 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap backdrop-blur-sm"
                >
                  <FiCheckCircle size={14} />
                  <span>Mark all read</span>
                </motion.button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="flex justify-center mb-2">
                    <div className="animate-spin h-5 w-5 text-cyan-400"></div>
                  </div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="text-3xl mb-2">😴</div>
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-cyan-400/10">
                  {notifications.slice(0, displayCount).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`px-4 py-3 hover:bg-cyan-500/10 transition cursor-pointer ${
                        notification.read ? "bg-transparent" : "bg-cyan-500/5"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="text-2xl mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  notification.read
                                    ? "text-gray-400"
                                    : "text-white"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-1 flex-shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={(e) =>
                                    handleMarkAsRead(notification.id, e)
                                  }
                                  className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition"
                                  title="Mark as read"
                                >
                                  <FiCheck size={16} />
                                </button>
                              )}
                              <button
                                onClick={(e) =>
                                  handleDeleteNotification(notification.id, e)
                                }
                                className="p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded transition"
                                title="Delete"
                              >
                                <MdClose size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {displayCount < notifications.length && (
                <div className="px-4 py-2 border-t border-cyan-400/20 text-center bg-cyan-500/5">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 5)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
                  >
                    Load more ({notifications.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 border-t border-cyan-400/20 text-center text-xs text-gray-400 hover:text-cyan-400 transition bg-cyan-500/5 hover:bg-cyan-500/10"
              >
                View all notifications →
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
