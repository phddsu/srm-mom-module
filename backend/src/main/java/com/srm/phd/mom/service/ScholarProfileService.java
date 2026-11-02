package com.srm.phd.mom.service;

import com.srm.phd.mom.dto.ScholarProfileDTO;
import com.srm.phd.mom.entity.Notification;
import com.srm.phd.mom.entity.ScholarProfile;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.entity.Role;
import com.srm.phd.mom.repository.NotificationRepository;
import com.srm.phd.mom.repository.ScholarProfileRepository;
import com.srm.phd.mom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScholarProfileService {

    @Autowired private ScholarProfileRepository profileRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private NotificationRepository notificationRepo;

    private static final String DRAFT = "DRAFT";
    private static final String PENDING = "PENDING_APPROVAL";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";

    public ScholarProfileDTO getOrCreate(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        ScholarProfile p = profileRepo.findByUserId(userId).orElseGet(() -> {
            ScholarProfile np = ScholarProfile.builder()
                .userId(userId)
                .status(DRAFT)
                .build();
            return profileRepo.save(np);
        });
        return toDTO(p, user);
    }

    public ScholarProfileDTO update(Long userId, ScholarProfileDTO dto) {
        ScholarProfile p = profileRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        if (APPROVED.equals(p.getStatus()) || PENDING.equals(p.getStatus())) {
            throw new RuntimeException("Profile is locked (status: " + p.getStatus() + ")");
        }
        if (dto.getUniversityRegId() != null) p.setUniversityRegId(dto.getUniversityRegId());
        if (dto.getBatch() != null) p.setBatch(dto.getBatch());
        if (dto.getMode() != null) p.setMode(dto.getMode());
        if (dto.getTentativeTopic() != null) p.setTentativeTopic(dto.getTentativeTopic());
        if (dto.getUniversityEmail() != null) p.setUniversityEmail(dto.getUniversityEmail());
        if (dto.getSupervisorId() != null) p.setSupervisorId(dto.getSupervisorId());
        profileRepo.save(p);
        User u = userRepo.findById(userId).orElseThrow();
        return toDTO(p, u);
    }

    public ScholarProfileDTO submit(Long userId) {
        ScholarProfile p = profileRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        if (p.getSupervisorId() == null) throw new RuntimeException("Please select a supervisor before submitting");
        if (p.getUniversityRegId() == null || p.getUniversityRegId().isBlank()) throw new RuntimeException("University Registration ID is required");
        if (p.getBatch() == null || p.getBatch().isBlank()) throw new RuntimeException("Batch is required");
        if (p.getMode() == null || p.getMode().isBlank()) throw new RuntimeException("Mode (Full-Time / Part-Time) is required");
        if (APPROVED.equals(p.getStatus())) throw new RuntimeException("Profile is already approved");

        p.setStatus(PENDING);
        p.setSubmittedAt(LocalDateTime.now());
        p.setRejectionRemarks(null);
        profileRepo.save(p);

        User scholar = userRepo.findById(userId).orElseThrow();

        Notification n = Notification.builder()
            .recipientUserId(p.getSupervisorId())
            .recipientRole("SUPERVISOR")
            .title("Scholar Profile Pending Approval")
            .message(scholar.getFullName() + " (" + scholar.getUsername() + ") has submitted their profile for approval.")
            .eventType("PROFILE_SUBMITTED")
            .isRead(false)
            .build();
        notificationRepo.save(n);

        return toDTO(p, scholar);
    }

    public List<ScholarProfileDTO> listPendingForGuide(Long guideId) {
        List<ScholarProfile> list = profileRepo.findBySupervisorIdAndStatus(guideId, PENDING);
        return list.stream().map(p -> {
            User u = userRepo.findById(p.getUserId()).orElse(null);
            return toDTO(p, u);
        }).collect(Collectors.toList());
    }

    public List<ScholarProfileDTO> listAllForGuide(Long guideId) {
        List<ScholarProfile> combined = new ArrayList<>();
        combined.addAll(profileRepo.findBySupervisorIdAndStatus(guideId, PENDING));
        combined.addAll(profileRepo.findBySupervisorIdAndStatus(guideId, REJECTED));
        combined.addAll(profileRepo.findBySupervisorIdAndStatus(guideId, APPROVED));
        return combined.stream().map(p -> {
            User u = userRepo.findById(p.getUserId()).orElse(null);
            return toDTO(p, u);
        }).collect(Collectors.toList());
    }

    public ScholarProfileDTO approve(Long guideId, Long profileId) {
        ScholarProfile p = profileRepo.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        if (!PENDING.equals(p.getStatus())) throw new RuntimeException("Profile is not pending approval");
        p.setStatus(APPROVED);
        p.setApprovedAt(LocalDateTime.now());
        profileRepo.save(p);

        Notification n = Notification.builder()
            .recipientUserId(p.getUserId())
            .recipientRole("SCHOLAR")
            .title("Profile Approved")
            .message("Your profile has been approved by your supervisor. It is now locked.")
            .eventType("PROFILE_APPROVED")
            .isRead(false)
            .build();
        notificationRepo.save(n);

        User u = userRepo.findById(p.getUserId()).orElse(null);
        return toDTO(p, u);
    }

    public ScholarProfileDTO reject(Long guideId, Long profileId, String remarks) {
        ScholarProfile p = profileRepo.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        if (!PENDING.equals(p.getStatus())) throw new RuntimeException("Profile is not pending approval");
        p.setStatus(REJECTED);
        p.setRejectionRemarks(remarks);
        profileRepo.save(p);

        Notification n = Notification.builder()
            .recipientUserId(p.getUserId())
            .recipientRole("SCHOLAR")
            .title("Profile Returned for Correction")
            .message("Your profile was returned by your supervisor. Remarks: " + (remarks == null ? "" : remarks))
            .eventType("PROFILE_REJECTED")
            .isRead(false)
            .build();
        notificationRepo.save(n);

        User u = userRepo.findById(p.getUserId()).orElse(null);
        return toDTO(p, u);
    }

    public List<User> listSupervisors() {
        return userRepo.findAllByRole(Role.SUPERVISOR);
    }

    private ScholarProfileDTO toDTO(ScholarProfile p, User u) {
        ScholarProfileDTO d = new ScholarProfileDTO();
        d.setId(p.getId());
        d.setUserId(p.getUserId());
        d.setSupervisorId(p.getSupervisorId());
        d.setUniversityRegId(p.getUniversityRegId());
        d.setBatch(p.getBatch());
        d.setMode(p.getMode());
        d.setTentativeTopic(p.getTentativeTopic());
        d.setUniversityEmail(p.getUniversityEmail());
        d.setStatus(p.getStatus());
        d.setRejectionRemarks(p.getRejectionRemarks());
        if (u != null) {
            d.setScholarFullName(u.getFullName());
            d.setScholarUsername(u.getUsername());
            d.setScholarEmail(u.getEmail());
            d.setAvatarUrl(u.getAvatarUrl());
        }
        if (p.getSupervisorId() != null) {
            userRepo.findById(p.getSupervisorId()).ifPresent(g -> d.setSupervisorName(g.getFullName()));
        }
        return d;
    }
}
