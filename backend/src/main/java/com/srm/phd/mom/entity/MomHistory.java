package com.srm.phd.mom.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mom_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mom_id", nullable = false)
    private Long momId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MomAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private MomStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 50)
    private MomStatus newStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_stage", length = 50)
    private MomStage previousStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_stage", length = 50)
    private MomStage newStage;

    @Column(name = "performed_by_user_id")
    private Long performedByUserId;

    @Column(name = "performed_by_username", length = 100)
    private String performedByUsername;

    @Column(name = "performed_by_role", length = 50)
    private String performedByRole;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "action_timestamp")
    private LocalDateTime actionTimestamp;

    @PrePersist
    protected void onCreate() {
        if (actionTimestamp == null) actionTimestamp = LocalDateTime.now();
    }
}