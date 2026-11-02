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
    private java.util.List<java.util.Map<String,Object>> sectionBCourseworks;
    private Integer sectionBCompletedCount;
    private Boolean sectionBCVCompleted;
    private String sectionBCVDate;
    private Boolean sectionBDcmConducted;
    private Boolean sectionBPrePhdCompleted;
    private Boolean sectionBSynopsisSubmitted;
    private Boolean sectionBThesisSubmitted;

    // Section C
    private java.util.List<java.util.Map<String,Object>> sectionCMilestones;

    // Section D
    private java.util.List<java.util.Map<String,Object>> sectionDThroughputs;

    // Section E
    private java.util.List<java.util.Map<String,Object>> sectionESkills;

    // Section F
    private java.util.List<java.util.Map<String,Object>> sectionFChallenges;
    private java.util.List<java.util.Map<String,Object>> sectionFParticipation;
    private java.util.List<java.util.Map<String,Object>> sectionFPlannedActivities;



    // Section G
    private Integer sectionGLabHours;
    private Integer sectionGTutorialHours;
    private String sectionGSupport;
    private String sectionGRemarks;
    private java.util.List<java.util.Map<String,Object>> sectionGLeaves;

    // Signature
    private String typedName;
}
