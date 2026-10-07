package com.srm.phd.mom.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "minutes_of_meeting")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinutesOfMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mom_number", unique = true, nullable = false, length = 50)
    private String momNumber;

    @Column(name = "scholar_id", nullable = false)
    private Long scholarId;

    @Transient
    private String scholarName;

    @Column(name = "supervisor_id", nullable = false)
    private Long supervisorId;

    @Transient
    private String supervisorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 50)
    private MomStatus currentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false, length = 50)
    private MomStage currentStage;

    // Period
    @Column(name = "period_year")
    private Integer periodYear;

    @Column(name = "period_month")
    private Integer periodMonth;

    // --- Section A ---
    @Column(name = "section_a_scholar_name") private String sectionAScholarName;
    @Column(name = "section_a_registration_date") private LocalDate sectionARegistrationDate;
    @Column(name = "section_a_session_year") private String sectionASessionYear;
    @Column(name = "section_a_supervisor_name") private String sectionASupervisorName;
    @Column(name = "section_a_cosupervisor_name") private String sectionACosupervisorName;
    @Column(name = "section_a_department") private String sectionADepartment;
    @Column(name = "section_a_scopus_id") private String sectionAScopusId;
    @Column(name = "section_a_orcid_id") private String sectionAOrcidId;
    @Column(name = "section_a_linked") private Boolean sectionALinked;
    @Column(name = "section_a_phd_title") private String sectionAPhdTitle;
    @Column(name = "section_a_funding") private String sectionAFunding;
    @Column(name = "section_a_jrf_srf") private String sectionAJrfSrf;
    @Column(name = "section_a_project_title") private String sectionAProjectTitle;
    @Column(name = "section_a_funding_agency") private String sectionAFundingAgency;
    @Column(name = "section_a_pi_name") private String sectionAPiName;

    // --- Section B ---
    @Column(name = "section_b_coursework_completed") private Boolean sectionBCourseworkCompleted;
    @Column(name = "section_b_courseworks_recommended") private Integer sectionBCourseworksRecommended;

    // --- Section C/D/E/F (JSONB) ---
    @Column(name = "section_c_milestones", columnDefinition = "jsonb") private String sectionCMilestones;
    @Column(name = "section_d_throughputs", columnDefinition = "jsonb") private String sectionDThroughputs;
    @Column(name = "section_e_skills", columnDefinition = "jsonb") private String sectionESkills;
    @Column(name = "section_f_challenges", columnDefinition = "jsonb") private String sectionFChallenges;

    // --- Section G ---
    @Column(name = "section_g_lab_hours") private Integer sectionGLabHours;
    @Column(name = "section_g_tutorial_hours") private Integer sectionGTutorialHours;
    @Column(name = "section_g_support") private String sectionGSupport;
    @Column(name = "section_g_remarks") private String sectionGRemarks;

    // --- Section H ---
    @Column(name = "section_h_month") private String sectionHMonth;
    @Column(name = "section_h_assessment_scores", columnDefinition = "jsonb") private String sectionHAssessmentScores;
    @Column(name = "section_h_recommendation") private String sectionHRecommendation;

    // --- Section I ---
    @Column(name = "section_i_certified_leave") private String sectionICertifiedLeave;
    @Column(name = "section_i_certified_fellowship") private String sectionICertifiedFellowship;
    @Column(name = "section_i_hoi_remarks", columnDefinition = "TEXT") private String sectionIHoiRemarks;
    @Column(name = "section_i_directorate_remarks", columnDefinition = "TEXT") private String sectionIDirectorateRemarks;
    @Column(name = "section_i_dean_remarks", columnDefinition = "TEXT") private String sectionIDeanRemarks;

    @Column(name = "section_f_participation", columnDefinition = "TEXT") private String sectionFParticipation;
    @Column(name = "section_f_planned_activities", columnDefinition = "TEXT") private String sectionFPlannedActivities;

    @Column(name = "submission_date") private LocalDateTime submissionDate;

    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}