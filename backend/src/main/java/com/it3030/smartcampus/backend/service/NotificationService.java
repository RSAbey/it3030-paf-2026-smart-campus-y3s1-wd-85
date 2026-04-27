package com.it3030.smartcampus.backend.service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.entity.Notification;
import com.it3030.smartcampus.backend.entity.NotificationSettings;
import com.it3030.smartcampus.backend.entity.StudentNotificationStatus;
import com.it3030.smartcampus.backend.entity.StudentNotificationStatusId;
import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.NotificationRepository;
import com.it3030.smartcampus.backend.repository.NotificationSettingsRepository;
import com.it3030.smartcampus.backend.repository.StudentNotificationStatusRepository;

@Service
public class NotificationService {

    private static final String ROLE_STUDENT = "student";
    private static final String ROLE_ADMIN = "admin";
    private static final String STATUS_DRAFT = "Draft";
    private static final String STATUS_PUBLISHED = "Published";
    private static final String VISIBILITY_PUBLIC = "Public";
    private static final String VISIBILITY_PRIVATE = "Private";
    private static final List<String> CATEGORIES = List.of(
            "Academic",
            "Maintenance",
            "Emergency",
            "Booking",
            "Tickets",
            "General"
    );
    private static final List<String> PRIORITIES = List.of("Low", "Medium", "High", "Critical");
    private static final List<String> STATUSES = List.of(STATUS_DRAFT, STATUS_PUBLISHED);
    private static final List<String> VISIBILITIES = List.of(VISIBILITY_PUBLIC, VISIBILITY_PRIVATE);

    private final NotificationRepository notificationRepository;
    private final StudentNotificationStatusRepository statusRepository;
    private final NotificationSettingsRepository settingsRepository;
    private final AuthService authService;

    public NotificationService(
            NotificationRepository notificationRepository,
            StudentNotificationStatusRepository statusRepository,
            NotificationSettingsRepository settingsRepository,
            AuthService authService
    ) {
        this.notificationRepository = notificationRepository;
        this.statusRepository = statusRepository;
        this.settingsRepository = settingsRepository;
        this.authService = authService;
    }

    public Notification createNotification(String adminEmail, Notification input) {
        // TODO: replace request-header role checks with JWT/Firebase token verification.
        User admin = authService.requireAdminUser(adminEmail);

        Notification notification = new Notification();
        applyNotificationFields(notification, input);
        notification.setCreatedBy(admin.getId());

        // TODO: integrate Firebase/push/email delivery after token-based notification delivery is added.
        return notificationRepository.save(notification);
    }

    public List<Notification> getAdminNotifications(String adminEmail) {
        authService.requireAdminUser(adminEmail);
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Notification updateNotification(String adminEmail, Long id, Notification input) {
        authService.requireAdminUser(adminEmail);

        Notification notification = getNotificationOrThrow(id);
        applyNotificationFields(notification, input);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(String adminEmail, Long id) {
        authService.requireAdminUser(adminEmail);

        if (!notificationRepository.existsById(id)) {
            throw new NoSuchElementException("Notification not found.");
        }

        notificationRepository.deleteById(id);
    }

    public Notification setPublishStatus(String adminEmail, Long id, Boolean published) {
        authService.requireAdminUser(adminEmail);

        Notification notification = getNotificationOrThrow(id);
        notification.setStatus(Boolean.TRUE.equals(published) ? STATUS_PUBLISHED : STATUS_DRAFT);
        return notificationRepository.save(notification);
    }

    public Notification setVisibility(
            String adminEmail,
            Long id,
            String visibility,
            Long targetUserId,
            String targetRole
    ) {
        authService.requireAdminUser(adminEmail);

        Notification notification = getNotificationOrThrow(id);
        notification.setVisibility(normalizeChoice(visibility, VISIBILITIES, "Visibility", notification.getVisibility()));
        notification.setTargetUserId(targetUserId);
        notification.setTargetRole(normalizeTargetRole(targetRole));
        normalizeVisibilityTarget(notification);
        return notificationRepository.save(notification);
    }

    public List<StudentNotificationView> getStudentNotifications(String studentEmail) {
        User student = authService.requireStudentUser(studentEmail);
        List<Notification> notifications = notificationRepository.findVisiblePublishedForStudent(student.getId());
        Map<Long, StudentNotificationStatus> statuses = statusRepository.findByIdStudentId(student.getId())
                .stream()
                .collect(Collectors.toMap(
                        status -> status.getId().getNotificationId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        return notifications.stream()
                .map(notification -> toStudentView(notification, statuses.get(notification.getId())))
                .toList();
    }

    public StudentNotificationView markStudentNotificationRead(String studentEmail, Long notificationId, boolean read) {
        User student = authService.requireStudentUser(studentEmail);
        Notification notification = getNotificationOrThrow(notificationId);

        if (!isVisibleToStudent(notification, student.getId())) {
            throw new SecurityException("Notification is not available for this student.");
        }

        StudentNotificationStatusId statusId = new StudentNotificationStatusId(student.getId(), notificationId);
        StudentNotificationStatus status = statusRepository.findById(statusId)
                .orElseGet(() -> new StudentNotificationStatus(statusId, false, null));

        status.setIsRead(read);
        status.setReadAt(read ? LocalDateTime.now() : null);
        StudentNotificationStatus savedStatus = statusRepository.save(status);

        return toStudentView(notification, savedStatus);
    }

    public NotificationSettingsResponse getStudentSettings(String studentEmail) {
        User student = authService.requireStudentUser(studentEmail);
        NotificationSettings settings = settingsRepository.findById(student.getId())
                .orElseGet(() -> createDefaultSettings(student.getId()));

        return toSettingsResponse(settings);
    }

    public NotificationSettingsResponse saveStudentSettings(
            String studentEmail,
            Boolean enabled,
            List<String> categories,
            Boolean highPriorityAlerts
    ) {
        User student = authService.requireStudentUser(studentEmail);
        NotificationSettings settings = settingsRepository.findById(student.getId())
                .orElseGet(() -> createDefaultSettings(student.getId()));

        settings.setEnabled(enabled == null || enabled);
        settings.setCategories(toCategoryCsv(categories));
        settings.setHighPriorityAlerts(highPriorityAlerts == null || highPriorityAlerts);

        return toSettingsResponse(settingsRepository.save(settings));
    }

    private void applyNotificationFields(Notification notification, Notification input) {
        if (input == null) {
            throw new IllegalArgumentException("Notification details are required.");
        }

        notification.setTitle(requireText(input.getTitle(), "Title"));
        notification.setMessage(requireText(input.getMessage(), "Message"));
        notification.setCategory(normalizeChoice(input.getCategory(), CATEGORIES, "Category", "General"));
        notification.setPriority(normalizeChoice(input.getPriority(), PRIORITIES, "Priority", "Medium"));
        notification.setVisibility(normalizeChoice(input.getVisibility(), VISIBILITIES, "Visibility", VISIBILITY_PUBLIC));
        notification.setStatus(normalizeChoice(input.getStatus(), STATUSES, "Status", STATUS_DRAFT));
        notification.setTargetUserId(input.getTargetUserId());
        notification.setTargetRole(normalizeTargetRole(input.getTargetRole()));

        normalizeVisibilityTarget(notification);
    }

    private Notification getNotificationOrThrow(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Notification ID is required.");
        }

        return notificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Notification not found."));
    }

    private void normalizeVisibilityTarget(Notification notification) {
        if (VISIBILITY_PUBLIC.equalsIgnoreCase(notification.getVisibility())) {
            notification.setTargetUserId(null);
            notification.setTargetRole(null);
            return;
        }

        if (notification.getTargetUserId() == null && isBlank(notification.getTargetRole())) {
            throw new IllegalArgumentException("Private notifications require a target user or role.");
        }
    }

    private boolean isVisibleToStudent(Notification notification, Long studentId) {
        if (!STATUS_PUBLISHED.equalsIgnoreCase(notification.getStatus())) {
            return false;
        }

        if (VISIBILITY_PUBLIC.equalsIgnoreCase(notification.getVisibility())) {
            return true;
        }

        return studentId.equals(notification.getTargetUserId())
                || ROLE_STUDENT.equalsIgnoreCase(notification.getTargetRole());
    }

    private StudentNotificationView toStudentView(
            Notification notification,
            StudentNotificationStatus status
    ) {
        boolean read = status != null && Boolean.TRUE.equals(status.getIsRead());

        return new StudentNotificationView(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCategory(),
                notification.getPriority(),
                notification.getVisibility(),
                notification.getTargetUserId(),
                notification.getTargetRole(),
                notification.getStatus(),
                notification.getCreatedBy(),
                notification.getCreatedAt(),
                notification.getUpdatedAt(),
                read,
                status == null ? null : status.getReadAt()
        );
    }

    private NotificationSettings createDefaultSettings(Long studentId) {
        NotificationSettings settings = new NotificationSettings();
        settings.setStudentId(studentId);
        settings.setEnabled(true);
        settings.setCategories(String.join(",", CATEGORIES));
        settings.setHighPriorityAlerts(true);
        return settings;
    }

    private NotificationSettingsResponse toSettingsResponse(NotificationSettings settings) {
        return new NotificationSettingsResponse(
                settings.getStudentId(),
                settings.getEnabled() == null || settings.getEnabled(),
                parseCategories(settings.getCategories()),
                settings.getHighPriorityAlerts() == null || settings.getHighPriorityAlerts()
        );
    }

    private String requireText(String value, String fieldName) {
        if (isBlank(value)) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }

        return value.trim();
    }

    private String normalizeChoice(String value, List<String> allowed, String fieldName, String defaultValue) {
        if (isBlank(value)) {
            return defaultValue;
        }

        String trimmed = value.trim();
        return allowed.stream()
                .filter(option -> option.equalsIgnoreCase(trimmed))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid " + fieldName.toLowerCase(Locale.ROOT) + "."));
    }

    private String normalizeTargetRole(String role) {
        if (isBlank(role)) {
            return null;
        }

        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if (!ROLE_STUDENT.equals(normalized) && !ROLE_ADMIN.equals(normalized)) {
            throw new IllegalArgumentException("Invalid target role.");
        }

        return normalized;
    }

    private String toCategoryCsv(List<String> categories) {
        if (categories == null) {
            return String.join(",", CATEGORIES);
        }

        Set<String> normalizedCategories = categories.stream()
                .filter(category -> !isBlank(category))
                .map(category -> normalizeChoice(category, CATEGORIES, "Category", "General"))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return String.join(",", normalizedCategories);
    }

    private List<String> parseCategories(String categories) {
        if (categories == null) {
            return CATEGORIES;
        }

        if (categories.trim().isEmpty()) {
            return List.of();
        }

        return List.of(categories.split(","))
                .stream()
                .map(String::trim)
                .filter(category -> !category.isEmpty())
                .toList();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public record StudentNotificationView(
            Long id,
            String title,
            String message,
            String category,
            String priority,
            String visibility,
            Long targetUserId,
            String targetRole,
            String status,
            Long createdBy,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Boolean isRead,
            LocalDateTime readAt
    ) {
    }

    public record NotificationSettingsResponse(
            Long studentId,
            Boolean enabled,
            List<String> categories,
            Boolean highPriorityAlerts
    ) {
    }
}
