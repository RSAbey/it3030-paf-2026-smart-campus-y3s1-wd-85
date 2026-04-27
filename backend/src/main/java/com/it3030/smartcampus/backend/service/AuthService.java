package com.it3030.smartcampus.backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.dto.AuthResponseDTO;
import com.it3030.smartcampus.backend.dto.LoginRequestDTO;
import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.UserRepository;
import com.it3030.smartcampus.backend.security.CampusUserPrincipal;
import com.it3030.smartcampus.backend.security.JwtService;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        AuthenticationManager authenticationManager,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        CampusUserPrincipal principal = new CampusUserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return new AuthResponseDTO(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole()
        );
    }
}
