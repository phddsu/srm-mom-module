package com.srm.phd.mom.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mom_section_attachment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomSectionAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mom_id", nullable = false)
    private Long momId;

    @Column(nullable = false, length = 20)
    private String section;      // "D", "E", "F_PART", "F_CHALL", "LEAVE", "C", ...

    @Column(name = "row_index")
    private Integer rowIndex;

    @Column(name = "file_name", length = 500)
    private String fileName;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 200)
    private String contentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}