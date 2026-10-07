package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.MomStage;
import com.srm.phd.mom.entity.MinutesOfMeeting;
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
@RequestMapping("/api/hoi/mom")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HEAD_OF_INSTITUTE')")
public class HoiMomController {

    private final MomService momService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<MinutesOfMeeting>> getPendingMoms() {
        return ResponseEntity.ok(momService.getPendingMomsForStage(MomStage.HEAD_OF_INSTITUTE));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MinutesOfMeeting> getMom(@PathVariable Long id) {
        return momService.getMomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<?> performAction(@PathVariable Long id,
                                            @RequestBody HoiActionRequest request,
                                            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getTypedName() != null && !request.getTypedName().isBlank()) {
            momService.signMom(id, user.getId(), "HEAD_OF_INSTITUTE", request.getTypedName());
        }

        MinutesOfMeeting mom = momService.hoiAction(
                id, user.getId(), request.getAction(), request.getRemarks(),
                request.getCertifiedLeave(), request.getCertifiedFellowship()
        );
        return ResponseEntity.ok(mom);
    }

    @Data
    public static class HoiActionRequest {
        private String action; // RECOMMEND or RETURN
        private String remarks;
        private String certifiedLeave;      // "YES" or "NO"
        private String certifiedFellowship; // "YES" or "NO"
        private String typedName;
    }
}