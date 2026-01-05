# Notification System Implementation Guide

## Overview

The notification system has been fully integrated into your MedLink application. It provides real-time notifications with a dropdown interface in the Navbar, allowing users to view, mark as read, and delete notifications.

## Files Modified/Created

### 1. **API Service** - `src/services/api.js`

Added 7 new notification API endpoints:

- `getUserNotifications(userId)` - Get all notifications for a user
- `getUnreadNotifications(userId)` - Get only unread notifications
- `getUnreadCount(userId)` - Get count of unread notifications
- `markNotificationAsRead(notificationId)` - Mark single notification as read
- `markAllNotificationsAsRead(userId)` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete a notification

### 2. **NotificationDropdown Component** - `src/Components/NotificationDropdown.js` (NEW)

A complete notification dropdown component with features:

- **Auto-fetch**: Automatically fetches notifications on component mount
- **Polling**: Updates notifications every 30 seconds
- **Real-time badges**: Shows unread count on notification icon
- **Mark as read**: Individual and bulk mark as read functionality
- **Delete**: Remove notifications one at a time
- **Responsive UI**: Beautiful dropdown with smooth animations
- **Time formatting**: Displays relative time (e.g., "5m ago", "2h ago")
- **Notification types**: Support for different notification types (appointment, prescription, message, result, alert, info)
- **Loading states**: Shows loading indicator while fetching

### 3. **Navbar Component** - `src/Components/Navbar.js`

Updated to integrate NotificationDropdown:

- Replaced static notification icon with the new NotificationDropdown component
- Maintains existing functionality for account and language menus
- Responsive design with Tailwind CSS

## Features

### 1. Notification Dropdown

- Displays up to 5 notifications at a time (scrollable)
- Shows unread badge count
- Smooth animations on open/close
- Click outside to close

### 2. Notification Actions

- **Mark as Read**: Click the check icon to mark individual notifications as read
- **Mark All as Read**: Bulk action button in dropdown header
- **Delete**: Remove notifications with the X icon
- **Auto-refresh**: Notifications update every 30 seconds

### 3. Visual Indicators

- **Red badge**: Shows number of unread notifications (99+ for more than 99)
- **Highlighted rows**: Unread notifications have a subtle background
- **Icons**: Different emoji icons for different notification types
- **Time stamps**: Shows when notification was received

### 4. Notification Types Supported

```
📅 appointment
💊 prescription
💬 message
🔬 result
⚠️  alert
ℹ️  info
🔔 default
```

## Backend Integration

The frontend expects your Spring Boot backend to provide notifications with the following structure:

```json
{
  "id": 1,
  "userId": 123,
  "title": "Appointment Confirmed",
  "message": "Your appointment with Dr. Smith is confirmed for tomorrow at 2:30 PM",
  "type": "appointment",
  "read": false,
  "createdAt": "2025-12-24T10:30:00Z"
}
```

## API Endpoints Expected

Based on your provided controller, ensure these endpoints are available:

```
GET  /api/notifications/user/{userId}
GET  /api/notifications/user/{userId}/unread
GET  /api/notifications/user/{userId}/unread/count
PUT  /api/notifications/{notificationId}/read
PUT  /api/notifications/user/{userId}/read-all
DELETE /api/notifications/{notificationId}
```

## How to Use

### For Developers

1. **Import the component** (already done in Navbar.js):

```javascript
import NotificationDropdown from "./NotificationDropdown";
```

2. **Use in JSX**:

```javascript
<NotificationDropdown />
```

3. **Send notifications from backend** (example):

```java
Notification notification = new Notification();
notification.setUserId(userId);
notification.setTitle("New Message");
notification.setMessage("You have a new message from Dr. Smith");
notification.setType("message");
notification.setRead(false);
notificationService.saveNotification(notification);
```

### For Users

1. **View Notifications**: Click the bell icon in the top navigation
2. **Mark as Read**: Click the checkmark icon on a notification
3. **Delete Notification**: Click the X icon
4. **Mark All as Read**: Click "Mark all read" button in dropdown header

## Customization

### Change Polling Interval

In `NotificationDropdown.js`, modify the interval (currently 30000ms = 30 seconds):

```javascript
const interval = setInterval(() => {
  fetchNotifications();
  fetchUnreadCount();
}, 30000); // Change this value
```

### Change Dropdown Width

In the `motion.div` className, modify `w-96`:

```javascript
className = "... w-96 ..."; // Change to w-80, w-[400px], etc.
```

### Add More Notification Types

In `getNotificationIcon()` function:

```javascript
const icons = {
  appointment: "📅",
  prescription: "💊",
  // Add more here
  "your-type": "🎯",
};
```

### Customize Styling

All styling uses Tailwind CSS classes. Modify colors and sizes in the component as needed:

- Primary color: `cyan-400`, `cyan-500`, `cyan-600`
- Text: `text-gray-300`, `text-gray-400`, etc.
- Backgrounds: `bg-[#121826]`, `bg-[#0a0f1c]`, etc.

## Testing

### Test Data Structure

To test locally, make sure your backend returns notifications in this format:

```javascript
[
  {
    id: 1,
    userId: 1,
    title: "Appointment Confirmed",
    message: "Your appointment is scheduled for tomorrow",
    type: "appointment",
    read: false,
    createdAt: new Date().toISOString(),
  },
  // ... more notifications
];
```

### Manual Testing Steps

1. Log in with a user account
2. Click the bell icon in navbar
3. Verify notifications load
4. Test marking as read
5. Test marking all as read
6. Test delete functionality
7. Verify count updates

## Error Handling

The component includes error handling for:

- Failed API calls
- Missing user context
- Empty notification arrays
- Loading states

All errors are logged to console for debugging.

## Performance Considerations

- **Polling**: Notifications update every 30 seconds (adjustable)
- **Max height**: Dropdown scrolls after showing multiple notifications
- **Animations**: Smooth Framer Motion animations for better UX
- **Memory**: Notifications are stored in component state

## Future Enhancements

Consider implementing:

1. **WebSocket integration** for real-time updates
2. **Sound/browser notifications** for new messages
3. **Notification preferences** page
4. **Notification filtering** by type
5. **Search** within notifications
6. **Archive** functionality
7. **Notification history** page
8. **Mobile push notifications** integration

## Troubleshooting

### Notifications not showing

- Check if user is logged in (context must have `user.userId`)
- Verify backend endpoints are working
- Check network tab in browser dev tools
- Ensure token is being sent in Authorization header

### Badge count not updating

- Clear browser cache
- Check if `getUnreadCount` endpoint works
- Verify polling interval is set correctly

### Dropdown not closing

- Check if ref is properly attached
- Verify click outside handler is working

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check browser dev tools for class conflicts
- Verify dark theme classes are applied

## Support

For issues or improvements, refer to:

- Backend: Ensure NotificationController endpoints match the frontend calls
- Frontend: Check browser console for detailed error messages
- Database: Verify notification records are being created with correct structure
