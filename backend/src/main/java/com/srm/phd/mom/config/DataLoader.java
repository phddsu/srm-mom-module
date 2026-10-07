package com.srm.phd.mom.config;

import com.srm.phd.mom.entity.*;
import com.srm.phd.mom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PeriodLockRepository periodLockRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if not present
        createUserIfNotFound("admin", "Admin@123", "Super Admin", Role.SUPER_ADMIN);
        createUserIfNotFound("scholar1", "Scholar@123", "Scholar One", Role.SCHOLAR);
        createUserIfNotFound("scholar2", "Scholar@123", "Scholar Two", Role.SCHOLAR);
        createUserIfNotFound("guide1", "Guide@123", "Guide One", Role.SUPERVISOR);
        createUserIfNotFound("guide2", "Guide@123", "Guide Two", Role.SUPERVISOR);
        createUserIfNotFound("hoi1", "Hoi@123", "Head of Institute", Role.HEAD_OF_INSTITUTE);
        createUserIfNotFound("dean1", "Dean@123", "Dean Research", Role.DEAN_RESEARCH);
        
        // NEW: Seed Coordinator user (Commit 3)
        createUserIfNotFound("coord1", "Coord@123", "Coordinator One", Role.INSTITUTIONAL_RESEARCH_COORDINATOR);

        // 2. Seed Period Lock for August 2026 if not present
        if (periodLockRepository.findByPeriodYearAndPeriodMonth(2026, 8).isEmpty()) {
            PeriodLock lock = PeriodLock.builder()
                    .periodYear(2026)
                    .periodMonth(8)
                    .deadline(LocalDate.of(2026, 9, 27))
                    .isLocked(false)
                    .build();
            periodLockRepository.save(lock);
        }
    }

    private void createUserIfNotFound(String username, String password, String fullName, Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .passwordHash(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .email(username + "@srm.edu.in")
                    .role(role)
                    .active(true)
                    .build();
            userRepository.save(user);
        }
    }
}