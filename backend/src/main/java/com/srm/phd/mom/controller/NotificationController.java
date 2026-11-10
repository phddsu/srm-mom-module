package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.Notification;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.NotificationRepository;
import com.srm.phd.mom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/send-alert")
    public ResponseEntity<?> sendAlert(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            String message = payload.get("message").toString();
            Long momId = payload.get("momId") != null ? Long.parseLong(payload.get("momId").toString()) : null;

            User scholar = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Scholar not found"));

            Notification notification = Notification.builder()
                    .recipientUserId(scholar.getId())
                    .recipientRole(scholar.getRole() != null ? scholar.getRole().name() : "SCHOLAR")
                    .momId(momId)
                    .title("Official Notice from Research Coordinator")
                    .message(message)
                    .eventType("COORDINATOR_NOTICE")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
            return ResponseEntity.ok("Notice sent successfully to " + scholar.getFullName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending notice: " + e.getMessage());
        }
    }

    @PostMapping("/send-message")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload) {
        try {
            Long senderId = Long.parseLong(payload.get("senderId").toString());
            Long recipientId = Long.parseLong(payload.get("recipientId").toString());
            String message = payload.get("message").toString();
            String title = payload.get("title").toString();

            User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
            User recipient = userRepository.findById(recipientId).orElse(null);
            if (recipient == null && payload.containsKey("recipientName")) {
                String rName = payload.get("recipientName").toString();
                recipient = userRepository.findAll().stream()
                    .filter(u -> u.getFullName() != null && u.getFullName().equalsIgnoreCase(rName))
                    .findFirst().orElse(null);
            }
            if (recipient == null) {
                throw new RuntimeException("Recipient not found for ID: " + recipientId + " or Name: " + payload.get("recipientName"));
            }

            Notification notification = Notification.builder()
                    .recipientUserId(recipient.getId())
                    .recipientRole(recipient.getRole() != null ? recipient.getRole().name() : "USER")
                    .title(title + " " + sender.getFullName())
                    .message(message)
                    .eventType("DIRECT_MESSAGE")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
            return ResponseEntity.ok("Message sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending message: " + e.getMessage());
        }
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyToCoordinator(@RequestBody Map<String, Object> payload) {
        try {
            Long scholarId = Long.parseLong(payload.get("scholarId").toString());
            String message = payload.get("message").toString();

            User scholar = userRepository.findById(scholarId).orElseThrow(() -> new RuntimeException("Scholar not found"));
            User coordinator = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole().name().equals("INSTITUTIONAL_RESEARCH_COORDINATOR"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));

            Notification reply = Notification.builder()
                    .recipientUserId(coordinator.getId())
                    .recipientRole(coordinator.getRole().name())
                    .title("Reply from Scholar: " + scholar.getFullName())
                    .message(message)
                    .eventType("SCHOLAR_REPLY")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(reply);
            return ResponseEntity.ok("Reply sent to Coordinator successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending reply: " + e.getMessage());
        }
    }
}