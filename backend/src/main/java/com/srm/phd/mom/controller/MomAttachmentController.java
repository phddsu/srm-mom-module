package com.srm.phd.mom.controller;

import com.srm.phd.mom.entity.MomSectionAttachment;
import com.srm.phd.mom.entity.User;
import com.srm.phd.mom.repository.MomRepository;
import com.srm.phd.mom.repository.MomSectionAttachmentRepository;
import com.srm.phd.mom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/mom")
@RequiredArgsConstructor
public class MomAttachmentController {

    private final MomSectionAttachmentRepository attachRepo;
    private final MomRepository momRepository;
    private final UserRepository userRepository;

    private static final String STORAGE = System.getProperty("user.dir") + java.io.File.separator + "uploads";

    @PostMapping("/{momId}/attachments")
    public ResponseEntity<?> upload(
            @PathVariable Long momId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("section") String section,
            @RequestParam(value = "rowIndex", required = false) Integer rowIndex,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {
        try {
            User user = userRepository.findByUsername(auth.getName()).orElseThrow();
            momRepository.findById(momId).orElseThrow(() -> new RuntimeException("MoM not found"));

            File dir = new File(STORAGE + File.separator + momId);
            if (!dir.exists()) dir.mkdirs();

            String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
            String stored = UUID.randomUUID() + ext;
            Path target = Paths.get(dir.getAbsolutePath(), stored);
            Files.copy(file.getInputStream(), target);

            MomSectionAttachment a = MomSectionAttachment.builder()
                    .momId(momId)
                    .section(section)
                    .rowIndex(rowIndex)
                    .fileName(original)
                    .filePath(target.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .description(description)
                    .uploadedBy(user.getId())
                    .build();
            attachRepo.save(a);
            return ResponseEntity.ok(a);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{momId}/attachments")
    public ResponseEntity<List<MomSectionAttachment>> list(
            @PathVariable Long momId,
            @RequestParam(value = "section", required = false) String section) {
        if (section != null) {
            return ResponseEntity.ok(attachRepo.findByMomIdAndSection(momId, section));
        }
        return ResponseEntity.ok(attachRepo.findByMomId(momId));
    }

    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        MomSectionAttachment a = attachRepo.findById(id).orElseThrow();
        File f = new File(a.getFilePath());
        if (!f.exists()) return ResponseEntity.notFound().build();

        Resource res = new FileSystemResource(f);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + a.getFileName() + "\"")
                .contentType(a.getContentType() != null ? MediaType.parseMediaType(a.getContentType()) : MediaType.APPLICATION_OCTET_STREAM)
                .body(res);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        MomSectionAttachment a = attachRepo.findById(id).orElseThrow();
        try { Files.deleteIfExists(Paths.get(a.getFilePath())); } catch (Exception ignored) {}
        attachRepo.delete(a);
        return ResponseEntity.ok().build();
    }
}