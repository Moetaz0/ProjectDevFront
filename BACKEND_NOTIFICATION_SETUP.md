# Backend Notification System Implementation

This guide helps you ensure your backend properly integrates with the frontend notification system.

## Quick Checklist

- ✅ NotificationController endpoints created (you already provided this)
- ⏳ Notification Entity with proper structure
- ⏳ NotificationService with business logic
- ⏳ NotificationRepository for database operations
- ⏳ Event listeners to create notifications when events occur

## Expected Notification Entity Structure

```java
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;  // The user receiving the notification

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type;  // appointment, prescription, message, result, alert, info

    @Column(nullable = false)
    private Boolean read = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime readAt;

    @Column
    private LocalDateTime deletedAt;
}
```

## Expected Repository Interface

```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndReadFalse(Long userId);

    Long countByUserIdAndReadFalse(Long userId);
}
```

## Expected Service Implementation

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Get all notifications for a user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Get unread notifications for a user
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    // Get unread notification count
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    // Mark a notification as read
    public Notification markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        throw new EntityNotFoundException("Notification not found");
    }

    // Mark all notifications as read for a user
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalse(userId);
        notifications.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(notifications);
    }

    // Delete a notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Create a notification (helper method)
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }
}
```

## Example: Creating Notifications for Appointments

```java
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public Appointment bookAppointment(AppointmentRequest request) {
        // ... existing code to create appointment ...

        // Create notification for patient
        notificationService.createNotification(
            appointmentDto.getPatientId(),
            "Appointment Confirmed",
            "Your appointment with Dr. " + doctor.getName() + " is confirmed for " +
            appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime(),
            "appointment"
        );

        // Create notification for doctor
        notificationService.createNotification(
            appointment.getDoctorId(),
            "New Appointment",
            "You have a new appointment with " + patient.getName() + " on " +
            appointment.getAppointmentDate(),
            "appointment"
        );

        return appointment;
    }
}
```

## Example: Creating Prescription Notifications

```java
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final NotificationService notificationService;

    public Prescription createPrescription(PrescriptionRequest request) {
        // ... existing code ...

        // Notify patient about new prescription
        notificationService.createNotification(
            prescription.getPatientId(),
            "New Prescription",
            "Dr. " + prescription.getDoctorName() + " has prescribed medications for you",
            "prescription"
        );

        return prescription;
    }
}
```

## Example: Creating Message Notifications

```java
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    public Message sendMessage(MessageRequest request) {
        // ... existing code ...

        // Notify recipient
        notificationService.createNotification(
            request.getRecipientId(),
            "New Message",
            "You have a new message from " + senderName,
            "message"
        );

        return message;
    }
}
```

## Expected Response Format

The endpoints should return data in this format:

### GET /api/notifications/user/{userId}

```json
[
  {
    "id": 1,
    "userId": 123,
    "title": "Appointment Confirmed",
    "message": "Your appointment with Dr. Smith is confirmed for tomorrow at 2:30 PM",
    "type": "appointment",
    "read": false,
    "createdAt": "2025-12-24T10:30:00"
  }
]
```

### GET /api/notifications/user/{userId}/unread/count

```json
5
```

### PUT /api/notifications/{notificationId}/read

```json
{
  "id": 1,
  "userId": 123,
  "title": "Appointment Confirmed",
  "message": "Your appointment with Dr. Smith is confirmed for tomorrow at 2:30 PM",
  "type": "appointment",
  "read": true,
  "createdAt": "2025-12-24T10:30:00"
}
```

## Database Migration (if using Flyway/Liquibase)

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_read (read)
);
```

## Testing the Integration

### Test with cURL

```bash
# Get user notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/123

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/user/123/unread/count

# Mark as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/1/read

# Delete notification
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/1
```

### Test with Postman

1. Import the NotificationController endpoints
2. Create a collection with variables:
   - `userId` = 123
   - `notificationId` = 1
   - `token` = your_jwt_token
3. Test each endpoint

## Common Issues

### 1. Endpoint returning 404

- Ensure controller is properly annotated with `@RestController`
- Check `@RequestMapping("/api/notifications")`
- Verify method annotations match expected verbs

### 2. Notifications not being created

- Add logging to your service methods
- Check if NotificationRepository is properly injected
- Verify database tables exist

### 3. Empty unread list

- Ensure `read = false` when creating notification
- Check if notifications are being queried by correct userId
- Verify database queries are correct

### 4. Timestamp issues

- Ensure `LocalDateTime` is being serialized correctly
- Use `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")` if needed
- Check timezone configuration

## Security Considerations

1. **User isolation**: Always verify userId in JWT token matches requested userId
2. **Authorization**: Only allow users to see their own notifications
3. **Rate limiting**: Consider rate limiting notification creation
4. **Input validation**: Validate title, message, and type fields
5. **SQL injection**: Use parameterized queries (JPA handles this)

## Performance Optimization

1. **Indexes**: Add indexes on userId and read columns (done in SQL above)
2. **Pagination**: Consider pagination for large notification lists
3. **Soft delete**: Use `deleted_at` instead of hard delete
4. **Archiving**: Move old notifications to archive table
5. **Caching**: Cache unread count with TTL

## Next Steps

1. Create the Notification entity class
2. Create NotificationRepository interface
3. Implement NotificationService
4. Ensure NotificationController exists and matches provided code
5. Test all endpoints
6. Deploy and verify frontend integration works
