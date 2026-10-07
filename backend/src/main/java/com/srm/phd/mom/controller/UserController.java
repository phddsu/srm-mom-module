package com.srm.phd.mom.controller;

import com.srm.phd.mom.dto.UserResponse;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .active(user.getActive())
                .build());
    }

    @GetMapping("/supervisors")
    public ResponseEntity<List<User>> getSupervisors() {
        return ResponseEntity.ok(userRepository.findAllByRole(com.srm.phd.mom.entity.Role.SUPERVISOR));
    }
}