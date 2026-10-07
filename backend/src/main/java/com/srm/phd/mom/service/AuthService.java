package com.srm.phd.mom.service;

import com.srm.phd.mom.dto.LoginRequest;
import com.srm.phd.mom.dto.LoginResponse;
import com.srm.phd.mom.dto.UserResponse;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import com.srm.phd.mom.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .active(user.getActive())
                .build();

        return new LoginResponse(token, userResponse);
    }
}