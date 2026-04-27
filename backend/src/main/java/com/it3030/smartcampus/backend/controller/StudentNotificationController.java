package com.it3030.smartcampus.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.service.NotificationService;
import com.it3030.smartcampus.backend.service.NotificationService.NotificationSettingsResponse;

@RestController
@RequestMapping("/api/student/notifications")
@CrossOrigin
public class StudentNotificationController {

    private final NotificationService notificationService;

    public StudentNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail
    ) {
        try {
            return ResponseEntity.ok(notificationService.getStudentNotifications(userEmail));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification marked as read",
                    "notification", notificationService.markStudentNotificationRead(userEmail, id, true)
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<?> markUnread(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification marked as unread",
                    "notification", notificationService.markStudentNotificationRead(userEmail, id, false)
            ));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail
    ) {
        try {
            return ResponseEntity.ok(notificationService.getStudentSettings(userEmail));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> saveSettings(
            @RequestHeader(name = "X-User-Email", required = false) String userEmail,
            @RequestBody NotificationSettingsRequest request
    ) {
        try {
            NotificationSettingsResponse settings = notificationService.saveStudentSettings(
                    userEmail,
                    request == null ? null : request.enabled(),
                    request == null ? null : request.categories(),
                    request == null ? null : request.highPriorityAlerts()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification settings saved",
                    "settings", settings
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

    public record NotificationSettingsRequest(
            Boolean enabled,
            List<String> categories,
            Boolean highPriorityAlerts
    ) {
    }
}
