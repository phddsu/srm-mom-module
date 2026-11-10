package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.Role;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null && !role.isEmpty()) {
            return ResponseEntity.ok(userRepository.findAll().stream().filter(u -> u.getRole().name().equals(role)).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getAllRoles() {
        return ResponseEntity.ok(Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.toList()));
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody Map<String, Object> payload) {
        User user = new User();
        user.setUsername((String) payload.get("username"));
        user.setFullName((String) payload.get("fullName"));
        user.setEmail((String) payload.get("email"));
        user.setDepartment((String) payload.get("department"));
        user.setDesignation((String) payload.get("designation"));
        user.setPhone((String) payload.get("phone"));
        user.setOfficeLocation((String) payload.get("officeLocation"));
        
        if (payload.get("role") != null) user.setRole(Role.valueOf((String) payload.get("role")));
        if (payload.get("active") != null) user.setActive(Boolean.parseBoolean(String.valueOf(payload.get("active"))));
        
        if (payload.get("password") != null) {
            user.setPasswordHash(passwordEncoder.encode((String) payload.get("password")));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        User existing = userRepository.findById(id).orElseThrow();
        
        if (payload.containsKey("fullName")) existing.setFullName((String) payload.get("fullName"));
        if (payload.containsKey("email")) existing.setEmail((String) payload.get("email"));
        if (payload.containsKey("department")) existing.setDepartment((String) payload.get("department"));
        if (payload.containsKey("designation")) existing.setDesignation((String) payload.get("designation"));
        if (payload.containsKey("phone")) existing.setPhone((String) payload.get("phone"));
        if (payload.containsKey("officeLocation")) existing.setOfficeLocation((String) payload.get("officeLocation"));
        if (payload.containsKey("role")) existing.setRole(Role.valueOf((String) payload.get("role")));
        if (payload.containsKey("active")) existing.setActive(Boolean.parseBoolean(String.valueOf(payload.get("active"))));
        
        if (payload.containsKey("password") && payload.get("password") != null && !String.valueOf(payload.get("password")).isEmpty()) {
            existing.setPasswordHash(passwordEncoder.encode((String) payload.get("password")));
        }
        return ResponseEntity.ok(userRepository.save(existing));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok("User deactivated");
    }

        @PostMapping("/users/bulk-upload")
    public ResponseEntity<?> bulkUploadScholars(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload an Excel file.");
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int successCount = 0;
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Map exactly to your Excel columns
                String fullName = formatter.formatCellValue(row.getCell(1)); // Column B
                String regNo = formatter.formatCellValue(row.getCell(2));    // Column C
                String email = formatter.formatCellValue(row.getCell(5));    // Column F

                if (email == null || email.trim().isEmpty()) continue;
                email = email.trim();

                // Skip if user already exists
                if (userRepository.findByUsername(email).isPresent()) continue;

                // Password is the Register Number (digits only)
                String defaultPassword = regNo.replaceAll("[^0-9]", "");
                if (defaultPassword.isEmpty()) defaultPassword = "12345678";

                User newScholar = User.builder()
                        .username(email) // Username IS the Email
                        .email(email)
                        .fullName(fullName)
                        .department("PhD Scholar")
                        .role(Role.SCHOLAR)
                        .requiresPasswordChange(true)
                        .active(true)
                        .passwordHash(passwordEncoder.encode(defaultPassword))
                        .build();

                userRepository.save(newScholar);
                successCount++;
            }

            return ResponseEntity.ok("Successfully imported " + successCount + " scholars. Login with Email, password is Register Number.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error parsing Excel: " + e.getMessage());
        }
    }
}