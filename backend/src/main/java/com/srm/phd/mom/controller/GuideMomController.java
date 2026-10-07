package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.MinutesOfMeeting;
import com.srm.phd.mom.entity.MomStage;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import com.srm.phd.mom.service.MomService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guide/mom")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERVISOR')")
public class GuideMomController {

    private final MomService momService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<MinutesOfMeeting>> getPendingMoms() {
        return ResponseEntity.ok(momService.getPendingMomsForStage(MomStage.GUIDE));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MinutesOfMeeting> getMom(@PathVariable Long id) {
        return momService.getMomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<?> performAction(@PathVariable Long id,
                                            @RequestBody GuideActionRequest request,
                                            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save signature
        if (request.getTypedName() != null && !request.getTypedName().isBlank()) {
            momService.signMom(id, user.getId(), "SUPERVISOR", request.getTypedName());
        }

        MinutesOfMeeting mom = momService.guideAction(
                id, user.getId(), request.getAction(), request.getRemarks(),
                request.getMonth(), request.getAssessmentScores()
        );
        return ResponseEntity.ok(mom);
    }

    @Data
    public static class GuideActionRequest {
        private String action;              // RECOMMEND or RETURN
        private String remarks;
        private String month;
        private String assessmentScores;    // JSON string of the 6 scores
        private String typedName;
    }
}