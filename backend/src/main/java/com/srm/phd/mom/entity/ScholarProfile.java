package com.srm.phd.mom.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scholar_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScholarProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "supervisor_id")
    private Long supervisorId;

    @Column(name = "university_reg_id", length = 100)
    private String universityRegId;

    @Column(length = 20)
    private String batch;

    @Column(length = 20)
    private String mode;

    @Column(name = "tentative_topic", length = 500)
    private String tentativeTopic;

    @Column(name = "university_email", length = 200)
    private String universityEmail;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "rejection_remarks", columnDefinition = "TEXT")
    private String rejectionRemarks;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
