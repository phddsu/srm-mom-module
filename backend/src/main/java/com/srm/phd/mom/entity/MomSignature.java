package com.srm.phd.mom.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mom_signature")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomSignature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mom_id", nullable = false)
    private Long momId;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(name = "signed_by_user_id")
    private Long signedByUserId;

    @Column(name = "signed_by_name", length = 200)
    private String signedByName;

    @Column(name = "signature_hash", length = 500)
    private String signatureHash;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @PrePersist
    protected void onCreate() {
        if (signedAt == null) signedAt = LocalDateTime.now();
    }
}