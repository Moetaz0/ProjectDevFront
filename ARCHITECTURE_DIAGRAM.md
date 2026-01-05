# 🏗️ Notification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Navbar Component                      │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │     NotificationDropdown Component              │   │   │
│  │  │                                                 │   │   │
│  │  │  • State Management (notifications, count)     │   │   │
│  │  │  • Auto-fetch on mount                        │   │   │
│  │  │  • 30-second polling                          │   │   │
│  │  │  • Click handlers                             │   │   │
│  │  │  • Animations (Framer Motion)                 │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Services Layer (api.js)                         │   │
│  │                                                          │   │
│  │  • getUserNotifications(userId)                        │   │
│  │  • getUnreadNotifications(userId)                      │   │
│  │  • getUnreadCount(userId)                              │   │
│  │  • markNotificationAsRead(id)                          │   │
│  │  • markAllNotificationsAsRead(userId)                  │   │
│  │  • deleteNotification(id)                              │   │
│  │                                                          │   │
│  │  [notificationService.js - Utility Functions]         │   │
│  │  • Formatting, filtering, sorting, mocking            │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP Requests
        ┌───────────────────────────────────────────┐
        │   JWT Token in Authorization Header       │
        └───────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          NotificationController (Given)                 │   │
│  │                                                          │   │
│  │  GET    /api/notifications/user/{userId}              │   │
│  │  GET    /api/notifications/user/{userId}/unread       │   │
│  │  GET    /api/notifications/user/{userId}/unread/count │   │
│  │  PUT    /api/notifications/{id}/read                  │   │
│  │  PUT    /api/notifications/user/{userId}/read-all     │   │
│  │  DELETE /api/notifications/{id}                        │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         NotificationService (TODO)                      │   │
│  │                                                          │   │
│  │  • getUserNotifications(Long userId)                   │   │
│  │  • getUnreadNotifications(Long userId)                 │   │
│  │  • getUnreadCount(Long userId)                         │   │
│  │  • markAsRead(Long notificationId)                     │   │
│  │  • markAllAsRead(Long userId)                          │   │
│  │  • deleteNotification(Long notificationId)             │   │
│  │  • createNotification(...) [Helper]                    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      NotificationRepository (TODO)                      │   │
│  │                                                          │   │
│  │  extends JpaRepository<Notification, Long>             │   │
│  │                                                          │   │
│  │  • findByUserId(Long userId)                           │   │
│  │  • findByUserIdAndReadFalse(Long userId)               │   │
│  │  • countByUserIdAndReadFalse(Long userId)              │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Notification Entity (TODO)                      │   │
│  │                                                          │   │
│  │  @Entity @Table("notifications")                       │   │
│  │  - id: Long @Id @GeneratedValue                        │   │
│  │  - userId: Long @Column @NotNull                       │   │
│  │  - title: String @Column @NotNull                      │   │
│  │  - message: String @Column                             │   │
│  │  - type: String @Column @NotNull                       │   │
│  │  - read: Boolean @Column @NotNull                      │   │
│  │  - createdAt: LocalDateTime @Column                    │   │
│  │  - readAt: LocalDateTime @Column                       │   │
│  │  - deletedAt: LocalDateTime @Column                    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (MySQL)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  notifications                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ id | userId | title | message | type | read | dates    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 1  │ 123    │ Appt  │ Msg     │ appt │ 0    │ 2025-12  │   │
│  │ 2  │ 123    │ Rx    │ Msg     │ prex │ 1    │ 2025-12  │   │
│  │ 3  │ 124    │ Msg   │ Msg     │ msg  │ 0    │ 2025-12  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Indexes:                                                         │
│  - idx_user_id (user_id)                                        │
│  - idx_read (read)                                              │
│  - idx_created_at (created_at)                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### 1. Component Mount

```
NotificationDropdown Mount
         ↓
checkAuth(user.userId)
         ↓
fetchNotifications()
         ↓
GET /api/notifications/user/{userId}/unread
         ↓
Update State: setNotifications(data)
         ↓
Render Dropdown with Notifications
         ↓
Setup Polling (30-second interval)
```

### 2. User Clicks Mark as Read

```
User clicks ✓ button on notification
         ↓
handleMarkAsRead(notificationId)
         ↓
PUT /api/notifications/{notificationId}/read
         ↓
Backend: Find notification → Set read=true → Save
         ↓
Response: Updated notification
         ↓
Frontend: Update local state
         ↓
Fetch new unread count
         ↓
Update badge: setUnreadCount(newCount)
```

### 3. Polling Update

```
Every 30 seconds:
         ↓
fetchNotifications()
         ↓
GET /api/notifications/user/{userId}/unread
         ↓
Compare with current state
         ↓
If different: Update state
         ↓
Trigger re-render
         ↓
User sees new notifications
```

### 4. Creating Notifications (From Other Services)

```
Example: User books appointment
         ↓
AppointmentService.bookAppointment()
         ↓
notificationService.createNotification(
  userId: patient,
  title: "Appointment Confirmed",
  message: "...",
  type: "appointment"
)
         ↓
Save to Notification table
         ↓
Frontend polling detects new notification
         ↓
Notification appears in dropdown
         ↓
Badge count increases
```

## Component Interaction

```
Navbar.js
    ↓
    ├── Account Menu
    │   ├── History
    │   ├── Prescriptions
    │   ├── Messages
    │   ├── Settings
    │   └── Logout
    │
    ├── NotificationDropdown ✨ NEW
    │   ├── Fetch Notifications
    │   ├── Display List
    │   │   ├── Notification Item 1
    │   │   │   ├── Mark as Read
    │   │   │   └── Delete
    │   │   ├── Notification Item 2
    │   │   │   ├── Mark as Read
    │   │   │   └── Delete
    │   │   └── ...
    │   ├── Mark All Read
    │   └── Unread Badge
    │
    └── Language Menu
        ├── English
        ├── French
        ├── Arabic
        └── Spanish
```

## Authentication Flow

```
User Login
    ↓
JWT Token received
    ↓
Token stored in localStorage
    ↓
API Interceptor (axios)
    ↓
Every request includes:
    Authorization: Bearer {token}
    ↓
Backend verifies JWT
    ↓
Extract userId from JWT
    ↓
Fetch only that user's notifications
    ↓
Return filtered results
```

## State Management

```
NotificationDropdown Component

State:
├── isOpen: boolean
│   └── Controls dropdown visibility
├── notifications: Notification[]
│   └── List of user's unread notifications
├── unreadCount: number
│   └── Number of unread notifications
├── loading: boolean
│   └── Indicates API call in progress
└── dropdownRef: useRef
    └── Reference for click-outside detection

Effects:
├── useEffect (mount/user change)
│   ├── Fetch notifications
│   ├── Fetch unread count
│   └── Setup polling interval
├── useEffect (polling cleanup)
│   └── Clear interval on unmount
└── useEffect (click-outside)
    └── Close dropdown when clicking outside

Handlers:
├── fetchNotifications()
├── fetchUnreadCount()
├── handleMarkAsRead(notificationId)
├── handleDeleteNotification(notificationId)
├── handleMarkAllAsRead()
└── Close on click outside
```

## API Call Sequence

```
Timeline:
↓
00:00 - Component mounts
├─ getUserNotifications() [GET]
└─ getUnreadCount() [GET]
↓
00:05 - User marks notification as read
├─ markNotificationAsRead(id) [PUT]
└─ fetchUnreadCount() [GET]
↓
00:30 - Polling interval
├─ getUnreadNotifications() [GET]
├─ getUnreadCount() [GET]
└─ Update state if different
↓
01:00 - Polling interval
├─ getUnreadNotifications() [GET]
├─ getUnreadCount() [GET]
└─ Update state if different
↓
02:15 - User deletes notification
├─ deleteNotification(id) [DELETE]
└─ fetchUnreadCount() [GET]
```

## Event Sources (Where Notifications Come From)

```
Various Backend Services
        ↓
┌───────┼───────┬──────────┬─────────┐
│       │       │          │         │
↓       ↓       ↓          ↓         ↓

Appointment   Prescription  Message   LabTest   Other
Service       Service       Service   Service   Services
  │             │             │         │        │
  └─────────────┼─────────────┼─────────┼────────┘
                │
    NotificationService
         │
    createNotification()
         │
    INSERT into notifications table
         │
    Frontend polling detects new row
         │
    Notification appears in UI
```

## Database Query Pattern

```
GET all notifications:
    SELECT * FROM notifications
    WHERE user_id = ?
    AND deleted_at IS NULL

GET unread:
    SELECT * FROM notifications
    WHERE user_id = ?
    AND read = false
    AND deleted_at IS NULL

Count unread:
    SELECT COUNT(*) FROM notifications
    WHERE user_id = ?
    AND read = false

Mark as read:
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE id = ?

Soft delete:
    UPDATE notifications
    SET deleted_at = NOW()
    WHERE id = ?
```

## Error Handling Flow

```
API Call
    ↓
    ├─ Success (2xx)
    │   └── Process response, update state
    │
    └─ Error
        ├── 401 Unauthorized
        │   └── Redirect to login
        ├── 403 Forbidden
        │   └── Show permission error
        ├── 404 Not Found
        │   └── Show not found error
        ├── 500 Server Error
        │   └── Show generic error
        └── Network Error
            └── Show retry option
                ↓
            Log error to console
                ↓
            UI remains functional
```

## Performance Optimization Points

```
1. Polling Interval
   └── 30 seconds (adjustable, higher = less traffic)

2. Data Pagination
   └── Show 5 at a time (scrollable, TODO)

3. Database Indexes
   └── user_id, read, created_at (prevents slow queries)

4. Caching
   └── Cache unread count with TTL (TODO)

5. Soft Deletes
   └── Don't actually delete, just mark (preserved audit trail)

6. Lazy Loading
   └── Load notification details on demand (TODO)
```

## Responsive Design

```
Desktop (≥1024px)
├── Navbar with all items horizontal
├── Notification dropdown 400px wide
└── Scrollable list (max 5 items visible)

Tablet (768px - 1023px)
├── Navbar items may wrap
├── Notification dropdown 350px wide
└── Adjusted spacing

Mobile (<768px)
├── Navbar hamburger menu (if applicable)
├── Notification dropdown fits screen
├── Full width on small screens
└── Touch-friendly buttons
```

---

**This architecture ensures:**

- ✅ Clean separation of concerns
- ✅ Scalable backend integration
- ✅ Real-time-like user experience (via polling)
- ✅ Secure JWT authentication
- ✅ Responsive across all devices
- ✅ Error handling & recovery
- ✅ Performance optimization
- ✅ User-friendly UI/UX

---

Created: December 24, 2025
