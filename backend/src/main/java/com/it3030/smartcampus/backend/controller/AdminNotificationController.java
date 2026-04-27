package com.it3030.smartcampus.backend.controller;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.entity.Notification;
import com.it3030.smartcampus.backend.service.NotificationService;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> createNotification(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @RequestBody Notification request
    ) {
        try {
            Notification notification = notificationService.createNotification(userEmail, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification created successfully",
                    "notification", notification
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail
    ) {
        try {
            return ResponseEntity.ok(notificationService.getAdminNotifications(userEmail));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id,
            @RequestBody Notification request
    ) {
        try {
            Notification notification = notificationService.updateNotification(userEmail, id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification updated successfully",
                    "notification", notification
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id
    ) {
        try {
            notificationService.deleteNotification(userEmail, id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification deleted successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<?> updatePublishStatus(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id,
            @RequestBody(required = false) PublishRequest request
    ) {
        try {
            boolean published = request == null || !Boolean.FALSE.equals(request.published());
            Notification notification = notificationService.setPublishStatus(userEmail, id, published);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", published ? "Notification published successfully" : "Notification unpublished successfully",
                    "notification", notification
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<?> updateVisibility(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id,
            @RequestBody VisibilityRequest request
    ) {
        try {
            Notification notification = notificationService.setVisibility(
                    userEmail,
                    id,
                    request == null ? null : request.visibility(),
                    request == null ? null : request.targetUserId(),
                    request == null ? null : request.targetRole()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification visibility updated successfully",
                    "notification", notification
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "success", false,
                "message", message == null ? "Request failed" : message
        ));
    }

    public record PublishRequest(Boolean published) {
    }

    public record VisibilityRequest(String visibility, Long targetUserId, String targetRole) {
    }
}
