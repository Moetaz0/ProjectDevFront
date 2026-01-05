import axios from "axios";
import { getUserFromToken } from "../utils/jwt";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * NOTIFICATION UTILITY SERVICE
 * Helper functions for notification operations
 */

class NotificationService {
  /**
   * Create a mock notification for testing
   * @param {Object} overrides - Override default properties
   * @returns {Object} Mock notification object
   */
  static createMockNotification(overrides = {}) {
    const defaults = {
      id: Math.floor(Math.random() * 1000),
      userId: getUserFromToken()?.userId || 1,
      title: "Sample Notification",
      message: "This is a test notification",
      type: "info",
      read: false,
      createdAt: new Date().toISOString(),
    };
    return { ...defaults, ...overrides };
  }

  /**
   * Generate sample notifications for development/testing
   * @param {number} count - Number of notifications to generate
   * @returns {Array} Array of mock notifications
   */
  static generateSampleNotifications(count = 5) {
    const types = [
      "appointment",
      "prescription",
      "message",
      "result",
      "alert",
      "info",
    ];
    const messages = [
      "Your appointment is confirmed for tomorrow at 2:30 PM",
      "New prescription from Dr. Smith is ready",
      "You have a new message from Dr. Johnson",
      "Your lab results are ready for review",
      "Appointment reminder: Your visit is in 1 hour",
      "New test results available",
      "Message from patient: Follow-up consultation needed",
    ];

    const notifications = [];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      notifications.push({
        id: i + 1,
        userId: getUserFromToken()?.userId || 1,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        message: message,
        type: type,
        read: i > 2, // First 3 are unread
        createdAt: new Date(Date.now() - i * 3600000).toISOString(), // Spread over hours
      });
    }
    return notifications;
  }

  /**
   * Format notification timestamp in human-readable format
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted time string
   */
  static formatNotificationTime(timestamp) {
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
  }

  /**
   * Get emoji icon for notification type
   * @param {string} type - Notification type
   * @returns {string} Emoji icon
   */
  static getNotificationIcon(type) {
    const icons = {
      appointment: "📅",
      prescription: "💊",
      message: "💬",
      result: "🔬",
      alert: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || "🔔";
  }

  /**
   * Get color class for notification type
   * @param {string} type - Notification type
   * @returns {string} Tailwind CSS classes
   */
  static getTypeColorClass(type) {
    const colors = {
      appointment: "bg-blue-500/10 border-blue-400/30",
      prescription: "bg-purple-500/10 border-purple-400/30",
      message: "bg-green-500/10 border-green-400/30",
      result: "bg-orange-500/10 border-orange-400/30",
      alert: "bg-red-500/10 border-red-400/30",
      info: "bg-cyan-500/10 border-cyan-400/30",
    };
    return colors[type] || "bg-gray-500/10 border-gray-400/30";
  }

  /**
   * Filter notifications by type
   * @param {Array} notifications - List of notifications
   * @param {string} type - Type to filter by
   * @returns {Array} Filtered notifications
   */
  static filterByType(notifications, type) {
    return notifications.filter((n) => n.type === type);
  }

  /**
   * Filter only unread notifications
   * @param {Array} notifications - List of notifications
   * @returns {Array} Unread notifications only
   */
  static filterUnread(notifications) {
    return notifications.filter((n) => !n.read);
  }

  /**
   * Sort notifications by date (newest first)
   * @param {Array} notifications - List of notifications
   * @returns {Array} Sorted notifications
   */
  static sortByDate(notifications) {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get notification summary statistics
   * @param {Array} notifications - List of notifications
   * @returns {Object} Summary statistics
   */
  static getSummary(notifications) {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

export default NotificationService;
