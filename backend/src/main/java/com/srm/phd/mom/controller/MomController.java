package com.srm.phd.mom.controller;

import com.srm.phd.mom.dto.MomFormDTO;
import com.srm.phd.mom.entity.*;
import com.srm.phd.mom.repository.*;
import com.srm.phd.mom.service.JournalPaperService;
import com.srm.phd.mom.service.MomNumberService;
import com.srm.phd.mom.service.MomService;
import com.srm.phd.mom.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mom")
@RequiredArgsConstructor
public class MomController {

    private final MomService momService;
    private final NotificationService notificationService;
    private final MomRepository momRepository;
    private final MomHistoryRepository momHistoryRepository;
    private final UserRepository userRepository;
    private final MomNumberService momNumberService;
    private final JournalPaperService journalPaperService;

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MinutesOfMeeting>> getAllMoms() {
        return ResponseEntity.ok(momRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<MinutesOfMeeting>> getMyMoms(Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(momRepository.findByScholarIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/create")
    public ResponseEntity<MinutesOfMeeting> createDraft(@RequestBody MomFormDTO dto, Authentication auth) {
        User user = currentUser(auth);

        int year = dto.getPeriodYear() != null ? dto.getPeriodYear() : java.time.LocalDate.now().getYear();
        int month = dto.getPeriodMonth() != null ? dto.getPeriodMonth() : java.time.LocalDate.now().getMonthValue();

        // Resolve a supervisor ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â fall back to the first SUPERVISOR user if not provided
        Long supervisorId = userRepository.findAllByRole(Role.SUPERVISOR)
                .stream()
                .findFirst()
                .map(User::getId)
                .orElse(4L);

        MinutesOfMeeting mom = MinutesOfMeeting.builder()
                .momNumber(momNumberService.generateMomNumber(year, month))
                .scholarId(user.getId())
                .supervisorId(supervisorId)
                .currentStatus(MomStatus.DRAFT)
                .currentStage(MomStage.SCHOLAR)
                .periodYear(year)
                .periodMonth(month)
                .build();

        momService.updateSectionsAtoG(mom, dto, user);
        momRepository.save(mom);
        return ResponseEntity.ok(mom);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MinutesOfMeeting> getMom(@PathVariable Long id) {
        return momService.getMomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id,
                                    @RequestBody MomFormDTO dto,
                                    Authentication auth) {
        try {
            User user = currentUser(auth);
            MinutesOfMeeting mom = momService.submitMom(id, user.getId(), dto);
            return ResponseEntity.ok(mom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/save")
    public ResponseEntity<?> save(@PathVariable Long id,
                                  @RequestBody MomFormDTO dto,
                                  Authentication auth) {
        User user = currentUser(auth);
        MinutesOfMeeting mom = momRepository.findById(id).orElseThrow(() -> new RuntimeException("MoM not found"));
        if (!mom.getScholarId().equals(user.getId())) throw new RuntimeException("Not your MoM");
        if (mom.getCurrentStatus() != MomStatus.DRAFT && !mom.getCurrentStatus().name().endsWith("_RETURNED"))
            throw new RuntimeException("MoM is not editable");
        momService.updateSectionsAtoG(mom, dto, user);
        momRepository.save(mom);
        return ResponseEntity.ok(mom);
    }


    private String or(String a, String b) { return (a != null && !a.isBlank()) ? a : b; }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<MomHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(momHistoryRepository.findByMomIdOrderByActionTimestampAsc(id));
    }

    @GetMapping("/{id}/journals")
    public ResponseEntity<List<JournalPaper>> getJournals(@PathVariable Long id) {
        return ResponseEntity.ok(journalPaperService.getPapersByMomId(id));
    }

    @PostMapping("/{id}/journals")
    public ResponseEntity<JournalPaper> addJournal(@PathVariable Long id, @RequestBody JournalPaper paper) {
        paper.setId(null);
        MinutesOfMeeting mom = momRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MoM not found"));
        paper.setMom(mom);
        return ResponseEntity.ok(journalPaperService.savePaper(paper));
    }

    @DeleteMapping("/journals/{paperId}")
    public ResponseEntity<?> deleteJournal(@PathVariable Long paperId) {
        journalPaperService.deletePaper(paperId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leaves")
    public ResponseEntity<?> saveLeaves(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            User user = currentUser(auth);
            MinutesOfMeeting mom = momRepository.findById(id).orElseThrow(() -> new RuntimeException("MoM not found"));
            
            // Allow saving if it's a draft
            if (mom.getCurrentStatus() != MomStatus.DRAFT && !mom.getCurrentStatus().name().endsWith("_RETURNED")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Can only edit leaves on a DRAFT MoM"));
            }

            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            // Use reflection to set the leaves field safely regardless of exact setter name
            mom.setSectionGLeaves(om.writeValueAsString(payload.get("leaves")));
            
            // If they clicked submit, update the status and notify the guide
            if (Boolean.TRUE.equals(payload.get("submit"))) {
                mom.setLeaveStatus("SUBMITTED");
                // Do NOT change currentStatus or currentStage here!
                
                // Notify Supervisor
                String scholarName = userRepository.findById(mom.getScholarId()).map(User::getFullName).orElse("Unknown Scholar");
                if (mom.getSupervisorId() != null) {
                    notificationService.createNotification(
                        mom.getSupervisorId(), "SUPERVISOR", mom.getId(),
                        "Leave Request Submitted",
                        "Scholar " + scholarName + " has submitted a Leave Request.",
                        "LEAVE_SUBMITTED"
                    );
                }
            }
            
            momRepository.save(mom);
            return ResponseEntity.ok(Map.of("message", "Success"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/leave-action")
    public ResponseEntity<?> leaveAction(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        try {
            MinutesOfMeeting mom = momRepository.findById(id).orElseThrow(() -> new RuntimeException("MoM not found"));
            String action = payload.get("action");
            
            if ("APPROVE".equals(action)) {
                mom.setLeaveStatus("APPROVED");
            } else {
                mom.setLeaveStatus("REJECTED");
            }
            momRepository.save(mom);
            return ResponseEntity.ok(Map.of("message", "Leave " + action + "D successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/alert")
    public ResponseEntity<?> sendAlert(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        try {
            MinutesOfMeeting mom = momRepository.findById(id).orElseThrow(() -> new RuntimeException("MoM not found"));
            String target = payload.get("target"); // "GUIDE" or "SCHOLAR"
            String message = payload.get("message");

            Long recipientId = target.equals("GUIDE") ? mom.getSupervisorId() : mom.getScholarId();
            String recipientRole = target.equals("GUIDE") ? "SUPERVISOR" : "SCHOLAR";

            notificationService.createNotification(
                recipientId, recipientRole, mom.getId(),
                "Alert from Research Coordinator",
                message,
                "COORDINATOR_ALERT"
            );
            return ResponseEntity.ok(Map.of("message", "Alert sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}