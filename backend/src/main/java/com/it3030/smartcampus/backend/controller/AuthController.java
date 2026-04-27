package com.it3030.smartcampus.backend.controller;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody AuthRequest request) {
        try {
            User user = authService.registerStudent(
                    request.email(),
                    request.password(),
                    request.confirmPassword()
            );
            return ResponseEntity.ok(toResponse(user));
        } catch (IllegalStateException ex) {
            return error(HttpStatus.CONFLICT, ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping("/login/student")
    public ResponseEntity<?> loginStudent(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(toResponse(authService.loginStudent(
                    request.email(),
                    request.password()
            )));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (SecurityException ex) {
            return authError(ex);
        }
    }

    @PostMapping("/login/admin")
    public ResponseEntity<?> loginAdmin(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(toResponse(authService.loginAdmin(
                    request.email(),
                    request.password()
            )));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (SecurityException ex) {
            return authError(ex);
        }
    }

    @GetMapping("/role")
    public ResponseEntity<?> getCurrentUserRole(@RequestParam String email) {
        try {
            return ResponseEntity.ok(Map.of("role", authService.getCurrentUserRole(email)));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping("/protect/admin")
    public ResponseEntity<?> protectAdmin(@RequestParam String email) {
        try {
            authService.protectAdmin(email);
            return ResponseEntity.ok(Map.of("allowed", true, "role", "admin"));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    @GetMapping("/protect/student")
    public ResponseEntity<?> protectStudent(@RequestParam String email) {
        try {
            authService.protectStudent(email);
            return ResponseEntity.ok(Map.of("allowed", true, "role", "student"));
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (NoSuchElementException ex) {
            return error(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (SecurityException ex) {
            return error(HttpStatus.FORBIDDEN, ex.getMessage());
        }
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getRole());
    }

    private ResponseEntity<Map<String, String>> authError(SecurityException ex) {
        String message = ex.getMessage() == null ? "Unauthorized." : ex.getMessage();
        boolean forbidden = message.contains("not authorized") || message.contains("Missing user role");
        HttpStatus status = forbidden ? HttpStatus.FORBIDDEN : HttpStatus.UNAUTHORIZED;

        return error(status, message);
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    // TODO(security): Replace request-body role checks with JWT/Firebase token verification and Spring Security filters.
    public record AuthRequest(String email, String password, String confirmPassword) {
    }

    public record AuthResponse(Long id, String email, String role) {
    }
}
