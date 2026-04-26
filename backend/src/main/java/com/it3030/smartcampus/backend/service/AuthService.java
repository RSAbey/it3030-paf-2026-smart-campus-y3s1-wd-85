package com.it3030.smartcampus.backend.service;

import java.util.Locale;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.UserRepository;

@Service
public class AuthService {

    private static final String ROLE_STUDENT = "student";
    private static final String ROLE_ADMIN = "admin";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@campus.edu";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerStudent(String email, String password, String confirmPassword) {
        String normalizedEmail = normalizeEmail(email);
        validatePassword(password);

        if (confirmPassword != null && !password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Confirm password must match password.");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalStateException("Email is already registered.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(password);
        user.setRole(ROLE_STUDENT);

        // TODO(security): Store a salted password hash instead of plain text before production.
        return userRepository.save(user);
    }

    public User loginStudent(String email, String password) {
        User user = login(email, password);
        requireRole(user, ROLE_STUDENT, "You are not authorized as student.");
        return user;
    }

    public User loginAdmin(String email, String password) {
        validatePassword(password);
        User user = findUserForAdminLogin(email, password);

        if (!password.equals(user.getPassword())) {
            throw new SecurityException("Invalid email or password.");
        }

        requireRole(user, ROLE_ADMIN, "You are not authorized as admin.");
        return user;
    }

    public String getCurrentUserRole(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new NoSuchElementException("User not found."));

        if (isBlank(user.getRole())) {
            throw new SecurityException("Missing user role. Please contact support.");
        }

        return normalizeRole(user.getRole());
    }

    public void protectAdmin(String email) {
        requireRoleByEmail(email, ROLE_ADMIN, "You are not authorized as admin.");
    }

    public void protectStudent(String email) {
        requireRoleByEmail(email, ROLE_STUDENT, "You are not authorized as student.");
    }

    private User login(String email, String password) {
        validatePassword(password);

        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new SecurityException("Invalid email or password."));

        if (!password.equals(user.getPassword())) {
            throw new SecurityException("Invalid email or password.");
        }

        return user;
    }

    private User findUserForAdminLogin(String email, String password) {
        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> createDefaultAdminIfAllowed(normalizedEmail, password));
    }

    private User createDefaultAdminIfAllowed(String email, String password) {
        if (!DEFAULT_ADMIN_EMAIL.equals(email) || !DEFAULT_ADMIN_PASSWORD.equals(password)) {
            throw new SecurityException("Invalid email or password.");
        }

        User admin = new User();
        admin.setEmail(DEFAULT_ADMIN_EMAIL);
        admin.setPassword(DEFAULT_ADMIN_PASSWORD);
        admin.setRole(ROLE_ADMIN);

        // TODO(security): Replace this development bootstrap with a secured admin seeding process.
        return userRepository.save(admin);
    }

    private void requireRoleByEmail(String email, String requiredRole, String errorMessage) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new NoSuchElementException("User not found."));

        requireRole(user, requiredRole, errorMessage);
    }

    private void requireRole(User user, String requiredRole, String errorMessage) {
        if (isBlank(user.getRole())) {
            throw new SecurityException("Missing user role. Please contact support.");
        }

        if (!requiredRole.equals(normalizeRole(user.getRole()))) {
            throw new SecurityException(errorMessage);
        }
    }

    private String normalizeEmail(String email) {
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email address is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        return role.trim().toLowerCase(Locale.ROOT);
    }

    private void validatePassword(String password) {
        if (isBlank(password)) {
            throw new IllegalArgumentException("Password is required.");
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }

        if (password.length() > 10) {
            throw new IllegalArgumentException("Password must be no more than 10 characters long.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
