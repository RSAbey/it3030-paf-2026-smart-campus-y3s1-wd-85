package com.it3030.smartcampus.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3030.smartcampus.backend.dto.AuthResponseDTO;
import com.it3030.smartcampus.backend.dto.LoginRequestDTO;
import com.it3030.smartcampus.backend.security.CampusUserPrincipal;
import com.it3030.smartcampus.backend.service.AuthService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDTO> me(@AuthenticationPrincipal CampusUserPrincipal principal) {
        return ResponseEntity.ok(
            new AuthResponseDTO(
                null,
                principal.getId(),
                principal.getName(),
                principal.getUsername(),
                principal.getRole()
            )
        );
    }
}
