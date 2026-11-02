package com.srm.phd.mom.controller;

import com.srm.phd.mom.dto.UserProfileDTO;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired private UserRepository userRepo;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> me(Authentication auth) {
        User u = currentUser(auth);
        return ResponseEntity.ok(toDTO(u));
    }

    @PutMapping("/me")
    public ResponseEntity<?> update(Authentication auth, @RequestBody UserProfileDTO dto) {
        try {
            User u = currentUser(auth);
            if (dto.getEmail() != null) u.setEmail(dto.getEmail());
            if (dto.getDepartment() != null) u.setDepartment(dto.getDepartment());
            if (dto.getDesignation() != null) u.setDesignation(dto.getDesignation());
            if (dto.getPhone() != null) u.setPhone(dto.getPhone());
            if (dto.getOfficeLocation() != null) u.setOfficeLocation(dto.getOfficeLocation());
            userRepo.save(u);
            return ResponseEntity.ok(toDTO(u));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    private User currentUser(Authentication auth) {
        Object p = auth.getPrincipal();
        if (p instanceof User) return (User) p;
        return userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserProfileDTO toDTO(User u) {
        UserProfileDTO d = new UserProfileDTO();
        d.setId(u.getId());
        d.setUsername(u.getUsername());
        d.setFullName(u.getFullName());
        d.setEmail(u.getEmail());
        d.setDepartment(u.getDepartment());
        d.setDesignation(u.getDesignation());
        d.setPhone(u.getPhone());
        d.setOfficeLocation(u.getOfficeLocation());
        d.setAvatarUrl(u.getAvatarUrl());
        d.setRole(u.getRole() != null ? u.getRole().name() : null);
        return d;
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") org.springframework.web.multipart.MultipartFile file, Authentication auth) {
        try {
            User u = currentUser(auth);
            if (file.isEmpty()) throw new RuntimeException("File is empty");
            
            String uploadDir = "C:/srm-mom-module/backend/uploads/avatars/";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) dir.mkdirs();
            
            String fileName = u.getId() + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);
            java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "http://localhost:8081/api/user/avatars/" + fileName;
            u.setAvatarUrl(fileUrl);
            userRepo.save(u);
            
            return ResponseEntity.ok(toDTO(u));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/avatars/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getAvatar(@PathVariable String fileName) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("C:/srm-mom-module/backend/uploads/avatars/" + fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                throw new RuntimeException("Could not read file: " + fileName);
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not read file: " + fileName, e);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            User u = currentUser(auth);
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");

            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

            if (currentPassword == null || !encoder.matches(currentPassword, u.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
            }
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));
            }

            u.setPasswordHash(encoder.encode(newPassword));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}