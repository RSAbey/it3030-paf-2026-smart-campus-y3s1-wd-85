package com.it3030.smartcampus.backend.security;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.it3030.smartcampus.backend.entity.User;
import com.it3030.smartcampus.backend.repository.UserRepository;

@Service
public class CampusUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CampusUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CampusUserPrincipal loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CampusUserPrincipal(user);
    }
}
