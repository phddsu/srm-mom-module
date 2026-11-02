package com.srm.phd.mom.dto;

import lombok.Data;

@Data
public class ScholarProfileDTO {
    private Long id;
    private Long userId;
    private Long supervisorId;
    private String universityRegId;
    private String batch;
    private String mode;
    private String tentativeTopic;
    private String universityEmail;
    private String status;
    private String rejectionRemarks;

    private String scholarFullName;
    private String scholarUsername;
    private String scholarEmail;
    private String supervisorName;
    private String avatarUrl;
}
