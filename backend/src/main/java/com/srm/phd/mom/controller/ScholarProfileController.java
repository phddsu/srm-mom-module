package com.srm.phd.mom.controller;

import com.srm.phd.mom.dto.ScholarProfileDTO;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import com.srm.phd.mom.service.ScholarProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ScholarProfileController {

    @Autowired private ScholarProfileService service;
    @Autowired private UserRepository userRepo;

    @GetMapping("/scholar/profile")
    public ResponseEntity<ScholarProfileDTO> getMine(Authentication auth) {
        Long userId = extractUserId(auth);
        return ResponseEntity.ok(service.getOrCreate(userId));
    }

    @PutMapping("/scholar/profile")
    public ResponseEntity<?> update(Authentication auth, @RequestBody ScholarProfileDTO dto) {
        try {
            Long userId = extractUserId(auth);
            return ResponseEntity.ok(service.update(userId, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/scholar/profile/submit")
    public ResponseEntity<?> submit(Authentication auth) {
        try {
            Long userId = extractUserId(auth);
            return ResponseEntity.ok(service.submit(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/scholar/profile/supervisors")
    public ResponseEntity<List<User>> supervisors() {
        return ResponseEntity.ok(service.listSupervisors());
    }

    @GetMapping("/guide/profile/pending")
    public ResponseEntity<List<ScholarProfileDTO>> pendingForGuide(Authentication auth) {
        Long guideId = extractUserId(auth);
        return ResponseEntity.ok(service.listPendingForGuide(guideId));
    }

    @GetMapping("/guide/profile/all")
    public ResponseEntity<List<ScholarProfileDTO>> allForGuide(Authentication auth) {
        Long guideId = extractUserId(auth);
        return ResponseEntity.ok(service.listAllForGuide(guideId));
    }

    @PostMapping("/guide/profile/{id}/approve")
    public ResponseEntity<?> approve(Authentication auth, @PathVariable Long id) {
        try {
            Long guideId = extractUserId(auth);
            return ResponseEntity.ok(service.approve(guideId, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/guide/profile/{id}/reject")
    public ResponseEntity<?> reject(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Long guideId = extractUserId(auth);
            return ResponseEntity.ok(service.reject(guideId, id, body.get("remarks")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Long extractUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof User) return ((User) principal).getId();
        String username = auth.getName();
        return userRepo.findByUsername(username).map(User::getId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
