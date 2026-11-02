package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.Role;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    @Autowired private UserRepository userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @GetMapping("/users")
    public ResponseEntity<?> list(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            try { users = userRepo.findAllByRole(Role.valueOf(role)); }
            catch (Exception e) { users = userRepo.findAll(); }
        } else {
            users = userRepo.findAll();
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : users) out.add(toMap(u));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> roles() {
        List<String> r = new ArrayList<>();
        for (Role role : Role.values()) r.add(role.name());
        return ResponseEntity.ok(r);
    }

    @PostMapping("/users")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            String fullName = body.get("fullName");
            String roleStr = body.get("role");
            if (username == null || username.isBlank()) throw new RuntimeException("Username is required");
            if (password == null || password.length() < 6) throw new RuntimeException("Password must be at least 6 characters");
            if (fullName == null || fullName.isBlank()) throw new RuntimeException("Full name is required");
            if (roleStr == null || roleStr.isBlank()) throw new RuntimeException("Role is required");
            if (userRepo.existsByUsername(username.trim())) throw new RuntimeException("Username already exists");

            User u = User.builder()
                .username(username.trim())
                .passwordHash(encoder.encode(password))
                .fullName(fullName.trim())
                .email(body.get("email"))
                .department(body.get("department"))
                .designation(body.get("designation"))
                .phone(body.get("phone"))
                .officeLocation(body.get("officeLocation"))
                .role(Role.valueOf(roleStr))
                .active(true)
                .build();
            userRepo.save(u);
            return ResponseEntity.ok(toMap(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            if (body.get("fullName") != null) u.setFullName(body.get("fullName"));
            if (body.get("email") != null) u.setEmail(body.get("email"));
            if (body.get("department") != null) u.setDepartment(body.get("department"));
            if (body.get("designation") != null) u.setDesignation(body.get("designation"));
            if (body.get("phone") != null) u.setPhone(body.get("phone"));
            if (body.get("officeLocation") != null) u.setOfficeLocation(body.get("officeLocation"));
            if (body.get("role") != null) u.setRole(Role.valueOf(body.get("role")));
            if (body.get("active") != null) u.setActive(Boolean.parseBoolean(body.get("active")));
            if (body.get("password") != null && !body.get("password").isBlank()) {
                u.setPasswordHash(encoder.encode(body.get("password")));
            }
            userRepo.save(u);
            return ResponseEntity.ok(toMap(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        try {
            User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            u.setActive(false);
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "User deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("fullName", u.getFullName());
        m.put("email", u.getEmail());
        m.put("role", u.getRole() != null ? u.getRole().name() : null);
        m.put("department", u.getDepartment());
        m.put("designation", u.getDesignation());
        m.put("phone", u.getPhone());
        m.put("officeLocation", u.getOfficeLocation());
        m.put("active", u.getActive());
        return m;
    }
}