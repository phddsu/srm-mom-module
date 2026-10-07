package com.srm.phd.mom.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class MomFormDTO {

    // Period
    private Integer periodYear;
    private Integer periodMonth;

    // Section A
    private String sectionAScholarName;
    private LocalDate sectionARegistrationDate;
    private String sectionASessionYear;
    private String sectionASupervisorName;
    private String sectionACosupervisorName;
    private String sectionADepartment;
    private String sectionAScopusId;
    private String sectionAOrcidId;
    private Boolean sectionALinked;
    private String sectionAPhdTitle;
    private String sectionAFunding;
    private String sectionAJrfSrf;
    private String sectionAProjectTitle;
    private String sectionAFundingAgency;
    private String sectionAPiName;

    // Section B
    private Boolean sectionBCourseworkCompleted;
    private Integer sectionBCourseworksRecommended;

    // Section C
    private List<MilestoneDTO> sectionCMilestones;

    // Section D
    private List<ThroughputDTO> sectionDThroughputs;

    // Section E
    private List<SkillsDTO> sectionESkills;

    // Section F
    private List<ChallengesDTO> sectionFChallenges;
    private List<ParticipationDTO> sectionFParticipation;
    private List<PlannedActivityDTO> sectionFPlannedActivities;



    // Section G
    private Integer sectionGLabHours;
    private Integer sectionGTutorialHours;
    private String sectionGSupport;
    private String sectionGRemarks;

    // Signature
    private String typedName;
}