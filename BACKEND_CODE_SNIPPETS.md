# Backend Code Snippets - Ready to Use

Copy and paste these code snippets to quickly implement the notification system.

## 1. Notification Entity

File: `src/main/java/com/cc/project/Entity/Notification.java`

```java
package com.cc.project.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    private String type; // appointment, prescription, message, result, alert, info

    @Column(nullable = false)
    @Builder.Default
    private Boolean read = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime readAt;

    @Column
    private LocalDateTime deletedAt;
}
```

## 2. Notification Repository

File: `src/main/java/com/cc/project/Repository/NotificationRepository.java`

```java
package com.cc.project.Repository;

import com.cc.project.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndReadFalse(Long userId);

    Long countByUserIdAndReadFalse(Long userId);

    List<Notification> findByUserIdAndDeletedAtIsNull(Long userId);
}
```

## 3. Notification Service

File: `src/main/java/com/cc/project/Service/NotificationService.java`

```java
package com.cc.project.Service;

import com.cc.project.Entity.Notification;
import com.cc.project.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdAndDeletedAtIsNull(userId);
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    /**
     * Get unread notification count
     */
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a notification as read
     */
    public Notification markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found with id: " + notificationId);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalse(userId);
        notifications.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(notifications);
    }

    /**
     * Delete a notification (soft delete)
     */
    public void deleteNotification(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setDeletedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Create a new notification
     */
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notification = Notification.builder()
            .userId(userId)
            .title(title)
            .message(message)
            .type(type)
            .read(false)
            .createdAt(LocalDateTime.now())
            .build();
        return notificationRepository.save(notification);
    }

    /**
     * Create notification with builder pattern
     */
    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }
}
```

## 4. Controller (Already Provided)

Your NotificationController is already created and matches what's needed.

## 5. Database Migration

File: `src/main/resources/db/migration/V1__Create_Notifications_Table.sql`

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message LONGTEXT,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    KEY idx_user_id (user_id),
    KEY idx_read (read),
    KEY idx_created_at (created_at),
    KEY idx_deleted_at (deleted_at)
);
```

## 6. Integration Example: Appointment Service

File: `src/main/java/com/cc/project/Service/AppointmentService.java`

Add this to your existing AppointmentService:

```java
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    // ... other dependencies

    public Appointment bookAppointment(AppointmentRequest request) {
        // ... existing code to create appointment ...
        Appointment appointment = new Appointment();
        // ... set appointment properties ...
        appointment = appointmentRepository.save(appointment);

        // Create notification for patient
        notificationService.createNotification(
            appointment.getPatientId(),
            "Appointment Confirmed",
            String.format(
                "Your appointment with Dr. %s is confirmed for %s at %s",
                appointment.getDoctorName(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
            ),
            "appointment"
        );

        // Create notification for doctor
        notificationService.createNotification(
            appointment.getDoctorId(),
            "New Appointment",
            String.format(
                "You have a new appointment with %s on %s",
                appointment.getPatientName(),
                appointment.getAppointmentDate()
            ),
            "appointment"
        );

        return appointment;
    }

    public Appointment cancelAppointment(Long appointmentId) {
        // ... existing cancellation code ...
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Notify patient
        notificationService.createNotification(
            appointment.getPatientId(),
            "Appointment Cancelled",
            "Your appointment has been cancelled",
            "alert"
        );

        // Notify doctor
        notificationService.createNotification(
            appointment.getDoctorId(),
            "Appointment Cancelled",
            "An appointment has been cancelled",
            "alert"
        );

        return appointment;
    }
}
```

## 7. Integration Example: Prescription Service

File: `src/main/java/com/cc/project/Service/PrescriptionService.java`

Add this to your PrescriptionService:

```java
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final NotificationService notificationService;
    // ... other dependencies

    public Prescription createPrescription(PrescriptionRequest request) {
        // ... existing code ...
        Prescription prescription = new Prescription();
        // ... set prescription properties ...
        prescription = prescriptionRepository.save(prescription);

        // Notify patient
        notificationService.createNotification(
            prescription.getPatientId(),
            "New Prescription",
            String.format(
                "Dr. %s has prescribed new medications for you",
                prescription.getDoctorName()
            ),
            "prescription"
        );

        return prescription;
    }

    public void updatePrescriptionStatus(Long prescriptionId, String status) {
        // ... existing code ...
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if ("ready".equals(status)) {
            notificationService.createNotification(
                prescription.getPatientId(),
                "Prescription Ready",
                "Your prescription is ready for pickup",
                "prescription"
            );
        }
    }
}
```

## 8. Integration Example: Message Service

File: `src/main/java/com/cc/project/Service/MessageService.java`

Add this to your MessageService:

```java
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;
    // ... other dependencies

    public Message sendMessage(MessageRequest request) {
        // ... existing code ...
        Message message = new Message();
        // ... set message properties ...
        message = messageRepository.save(message);

        // Notify recipient
        String senderName = getSenderName(message.getSenderId());
        notificationService.createNotification(
            message.getRecipientId(),
            "New Message",
            String.format("You have a new message from %s", senderName),
            "message"
        );

        return message;
    }

    private String getSenderName(Long senderId) {
        // Implement to get sender name from database
        return "User";
    }
}
```

## 9. Event Listener Example (Optional)

File: `src/main/java/com/cc/project/Listener/AppointmentEventListener.java`

```java
package com.cc.project.Listener;

import com.cc.project.Entity.Appointment;
import com.cc.project.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void onAppointmentConfirmed(AppointmentConfirmedEvent event) {
        Appointment appointment = event.getAppointment();

        notificationService.createNotification(
            appointment.getPatientId(),
            "Appointment Confirmed",
            String.format(
                "Your appointment with Dr. %s is confirmed",
                appointment.getDoctorName()
            ),
            "appointment"
        );
    }

    @EventListener
    public void onAppointmentCancelled(AppointmentCancelledEvent event) {
        Appointment appointment = event.getAppointment();

        notificationService.createNotification(
            appointment.getPatientId(),
            "Appointment Cancelled",
            "Your appointment has been cancelled",
            "alert"
        );
    }
}
```

## 10. Test Class Example

File: `src/test/java/com/cc/project/Service/NotificationServiceTest.java`

```java
package com.cc.project.Service;

import com.cc.project.Entity.Notification;
import com.cc.project.Repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        testNotification = Notification.builder()
            .id(1L)
            .userId(1L)
            .title("Test Notification")
            .message("Test message")
            .type("info")
            .read(false)
            .build();
    }

    @Test
    public void testGetUserNotifications() {
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdAndDeletedAtIsNull(1L))
            .thenReturn(notifications);

        List<Notification> result = notificationService.getUserNotifications(1L);

        assertEquals(1, result.size());
        assertEquals("Test Notification", result.get(0).getTitle());
        verify(notificationRepository, times(1)).findByUserIdAndDeletedAtIsNull(1L);
    }

    @Test
    public void testMarkAsRead() {
        when(notificationRepository.findById(1L))
            .thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(testNotification))
            .thenReturn(testNotification);

        Notification result = notificationService.markAsRead(1L);

        assertTrue(result.getRead());
        assertNotNull(result.getReadAt());
    }

    @Test
    public void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndReadFalse(1L))
            .thenReturn(3L);

        Long count = notificationService.getUnreadCount(1L);

        assertEquals(3L, count);
    }
}
```

## Quick Copy-Paste Checklist

1. ✅ Copy Entity code → `src/main/java/com/cc/project/Entity/Notification.java`
2. ✅ Copy Repository code → `src/main/java/com/cc/project/Repository/NotificationRepository.java`
3. ✅ Copy Service code → `src/main/java/com/cc/project/Service/NotificationService.java`
4. ✅ Controller already exists (verify it matches)
5. ✅ Copy SQL migration → `src/main/resources/db/migration/V1__Create_Notifications_Table.sql`
6. ✅ Update AppointmentService → Add notification calls
7. ✅ Update PrescriptionService → Add notification calls
8. ✅ Update MessageService → Add notification calls
9. ✅ Create test class → `src/test/java/.../NotificationServiceTest.java`
10. ✅ Test all endpoints → Use Postman or cURL

## Important Notes

- ⚠️ Adjust package names to match your project structure
- ⚠️ Ensure all imports are correct
- ⚠️ Update JPA imports (`jakarta.persistence` vs `javax.persistence`) based on your Spring version
- ⚠️ Add `@Transactional` where needed for bulk operations
- ⚠️ Consider adding exception handling with custom exceptions
- ⚠️ Add logging with SLF4J for debugging

## Next Steps

1. Copy all code snippets
2. Update package names
3. Run database migration
4. Run tests
5. Test endpoints with Postman
6. Verify frontend integration
7. Deploy!

---

**Created**: December 24, 2025
**Status**: Ready to Copy & Paste
