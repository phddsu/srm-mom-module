package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.MomStage;
import com.srm.phd.mom.entity.MinutesOfMeeting;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.UserRepository;
import com.srm.phd.mom.service.MomService;
import com.srm.phd.mom.service.PdfService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/dean/mom")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DEAN_RESEARCH')")
public class DeanResearchMomController {

    private final MomService momService;
    private final PdfService pdfService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<MinutesOfMeeting>> getPendingMoms() {
        return ResponseEntity.ok(momService.getPendingMomsForStage(MomStage.DEAN_RESEARCH));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MinutesOfMeeting> getMom(@PathVariable Long id) {
        return momService.getMomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/action")
    public ResponseEntity<?> performAction(@PathVariable Long id,
                                            @RequestBody DeanActionRequest request,
                                            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getTypedName() != null && !request.getTypedName().isBlank()) {
            momService.signMom(id, user.getId(), "DEAN_RESEARCH", request.getTypedName());
        }

        MinutesOfMeeting mom = momService.deanAction(
                id, user.getId(), request.getAction(), request.getRemarks()
        );
        return ResponseEntity.ok(mom);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<InputStreamResource> downloadPdf(@PathVariable Long id) {
        MinutesOfMeeting mom = momService.getMomById(id)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        ByteArrayInputStream pdfStream = pdfService.generateMomPdf(mom);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=MoM-" + mom.getMomNumber() + ".pdf");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdfStream));
    }

    @PostMapping("/{id}/upload-signed")
    public ResponseEntity<?> uploadSignedCopy(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        // TODO: Save file to disk and record in mom_attachment table
        return ResponseEntity.ok("Signed copy uploaded successfully");
    }

    @Data
    public static class DeanActionRequest {
        private String action; // APPROVE or REJECT
        private String remarks;
        private String typedName;
    }
}