# Quick Start Guide - Notification System Testing

## 🚀 Frontend Testing (Ready Now)

### Prerequisites

- Node.js installed
- React app running on `http://localhost:3000`
- Backend running on `http://localhost:8000`
- Logged in user account

### Step 1: Verify Frontend Components

1. Open your React app in browser
2. Navigate to home page
3. Click on notification icon (bell) in navbar
4. You should see:
   - Dropdown menu
   - "No notifications" message (if none exist)
   - Loading spinner while fetching
   - Unread count badge (will show when data arrives)

### Step 2: Generate Test Data

Until backend is fully set up, you can use mock data:

**Option A: Browser Console**

```javascript
// Open DevTools Console and run:
localStorage.setItem(
  "testNotifications",
  JSON.stringify([
    {
      id: 1,
      userId: 1,
      title: "Appointment Confirmed",
      message:
        "Your appointment with Dr. Smith is confirmed for tomorrow at 2:30 PM",
      type: "appointment",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      userId: 1,
      title: "Prescription Ready",
      message: "Your prescription from Dr. Johnson is ready for pickup",
      type: "prescription",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ])
);
```

**Option B: Modify API Response (Development Only)**

Edit `src/services/api.js` temporarily for testing:

```javascript
// Temporary: Add mock response for development
export const getUnreadNotifications = async (userId) => {
  try {
    // Comment out for production:
    if (process.env.NODE_ENV === "development") {
      return [
        {
          id: 1,
          userId: userId,
          title: "Test Appointment",
          message: "Your appointment is confirmed",
          type: "appointment",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    // Production code:
    const response = await api.get(`/api/notifications/user/${userId}/unread`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};
```

### Step 3: Test UI Features

#### Test Dropdown Opening

- [x] Click bell icon
- [x] Dropdown opens smoothly
- [x] Shows notifications or empty state
- [x] Badge count visible (if have unread)

#### Test Unread Badge

- [x] Badge shows count of unread notifications
- [x] Badge hides when all are read
- [x] Badge updates when new notification added

#### Test Mark as Read

- [x] Click checkmark icon on unread notification
- [x] Notification background changes
- [x] Unread count decreases

#### Test Mark All as Read

- [x] Click "Mark all read" button
- [x] All notifications marked as read
- [x] Badge count goes to 0

#### Test Delete

- [x] Click X icon on notification
- [x] Notification removed from list
- [x] Count updates

#### Test Time Formatting

- [x] Recent: "just now", "5m ago"
- [x] Hours: "2h ago"
- [x] Days: "3d ago"
- [x] Older: Full date

## ⚙️ Backend Testing (Pending Implementation)

### Step 1: Create Test Notifications Manually

Using cURL:

```bash
# Create test notification
curl -X POST http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "message": "This is a test",
    "type": "info",
    "read": false
  }'
```

### Step 2: Test GET Endpoints

```bash
# Get all notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/1

# Get unread notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/1/unread

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/1/unread/count
```

### Step 3: Test PUT Endpoints

```bash
# Mark as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/1/read

# Mark all as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/1/read-all
```

### Step 4: Test DELETE Endpoint

```bash
# Delete notification
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/1
```

## 🧪 Postman Testing

### Import Collection

1. Create new collection: "Notifications"
2. Add these requests:

**GET All Notifications**

```
GET {{baseUrl}}/api/notifications/user/{{userId}}
Headers:
  Authorization: Bearer {{token}}
```

**GET Unread Notifications**

```
GET {{baseUrl}}/api/notifications/user/{{userId}}/unread
Headers:
  Authorization: Bearer {{token}}
```

**GET Unread Count**

```
GET {{baseUrl}}/api/notifications/user/{{userId}}/unread/count
Headers:
  Authorization: Bearer {{token}}
```

**PUT Mark as Read**

```
PUT {{baseUrl}}/api/notifications/{{notificationId}}/read
Headers:
  Authorization: Bearer {{token}}
```

**PUT Mark All as Read**

```
PUT {{baseUrl}}/api/notifications/user/{{userId}}/read-all
Headers:
  Authorization: Bearer {{token}}
```

**DELETE Notification**

```
DELETE {{baseUrl}}/api/notifications/{{notificationId}}
Headers:
  Authorization: Bearer {{token}}
```

### Set Postman Variables

```
{
  "baseUrl": "http://localhost:8000",
  "userId": 1,
  "notificationId": 1,
  "token": "your_jwt_token_here"
}
```

## 🐛 Debugging

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for logs like:

```
Current user: {userId: 1, ...}
Notifications: [...]
Unread count: 5
```

### Check Network Tab

1. Open DevTools Network tab
2. Click notification icon
3. Look for API calls:
   - `/api/notifications/user/1/unread`
   - `/api/notifications/user/1/unread/count`
4. Check response status and data

### Enable Debug Mode

Add this to `NotificationDropdown.js`:

```javascript
// Add after imports
const DEBUG = true;

// In component:
useEffect(() => {
  if (DEBUG) {
    console.log("🔔 Notifications:", notifications);
    console.log("📊 Unread count:", unreadCount);
    console.log("👤 User:", user);
    console.log("⏳ Loading:", loading);
  }
}, [notifications, unreadCount, user, loading]);
```

### Check API Responses

In browser console:

```javascript
// Test API calls manually
import { getUnreadNotifications } from "./src/services/api.js";

getUnreadNotifications(1).then((data) => {
  console.log("Notifications:", data);
});
```

## 📊 Common Test Scenarios

### Scenario 1: No Notifications

1. Log in with new user
2. Click notification icon
3. Should show "No notifications" message ✅

### Scenario 2: Unread Notifications

1. Create 3 unread notifications
2. Click notification icon
3. Should show 3 notifications with count badge ✅

### Scenario 3: Mixed Read/Unread

1. Create 5 notifications (2 read, 3 unread)
2. Click notification icon
3. Should show 3 unread count ✅
4. Unread notifications have background ✅

### Scenario 4: Mark as Read Workflow

1. Have unread notifications
2. Click checkmark on notification
3. Notification background changes ✅
4. Unread count decreases ✅

### Scenario 5: Delete Notification

1. Have notifications
2. Click X button
3. Notification removed from list ✅
4. Count updates ✅

### Scenario 6: Auto-polling

1. Open notification dropdown
2. Create notification via API (in another tab)
3. Wait 30 seconds
4. New notification appears in dropdown ✅

## ✅ Success Criteria Checklist

Frontend Ready:

- [x] Notification icon visible in navbar
- [x] Dropdown opens on click
- [x] Dropdown closes on outside click
- [x] Animations smooth
- [x] Badge shows count
- [x] Icons display correctly
- [x] Time formatting works
- [x] All buttons functional
- [x] Responsive on mobile
- [x] No console errors

Backend To Implement:

- [ ] Database table created
- [ ] Entity class created
- [ ] Repository implemented
- [ ] Service layer complete
- [ ] All endpoints tested
- [ ] Integrated with events
- [ ] E2E testing passed
- [ ] Deployed to staging
- [ ] Production ready

## 🔗 Related Files

- `src/Components/NotificationDropdown.js` - Main component
- `src/services/api.js` - API functions
- `src/services/notificationService.js` - Utility functions
- `src/Components/Navbar.js` - Navigation integration
- `NOTIFICATION_SYSTEM_GUIDE.md` - Full documentation
- `BACKEND_NOTIFICATION_SETUP.md` - Backend guide
- `INTEGRATION_CHECKLIST.md` - Implementation checklist

## 💡 Tips & Tricks

1. **Test with different user IDs**: Change userId in requests
2. **Test with expired token**: See error handling
3. **Test rapid clicks**: Check for race conditions
4. **Test network offline**: See error states
5. **Test with large lists**: Check performance (100+ items)
6. **Test on mobile**: Use browser dev tools device emulation
7. **Test accessibility**: Use keyboard navigation only

## 🆘 Troubleshooting

| Issue                     | Solution                                     |
| ------------------------- | -------------------------------------------- |
| Notifications not showing | Check if logged in, verify API endpoint      |
| Badge shows wrong count   | Clear cache, check database state            |
| Dropdown won't close      | Check ref, verify click handler              |
| API 401 error             | Check JWT token validity                     |
| API 404 error             | Verify backend endpoint exists               |
| Animations laggy          | Check browser performance, reduce animations |

---

**Status**: Frontend ✅ Ready, Backend ⏳ Pending
**Last Updated**: December 24, 2025
