package com.srm.phd.mom.service;

import com.srm.phd.mom.dto.MomFormDTO;
import com.srm.phd.mom.entity.*;
import com.srm.phd.mom.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MomService {

    private final MomRepository momRepository;
    private final MomHistoryRepository momHistoryRepository;
    private final MomSignatureRepository momSignatureRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PeriodLockService periodLockService;

    // --- 1. SCHOLAR ACTIONS ---
    @Transactional
    public MinutesOfMeeting submitMom(Long momId, Long scholarId, MomFormDTO formDTO) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        // Period Lock Check
        if (periodLockService.isPeriodLocked(mom.getPeriodYear(), mom.getPeriodMonth())) {
            throw new RuntimeException("This assessment period is locked.");
        }

        // Update Sections A-G from DTO (Mapping logic depends on your DTO structure)
        updateSectionsAtoG(mom, formDTO, userRepository.findById(scholarId).orElseThrow());

        mom.setCurrentStatus(MomStatus.SUBMITTED);
        mom.setCurrentStage(MomStage.GUIDE);
        mom.setSubmissionDate(LocalDateTime.now());
        momRepository.save(mom);

        // History
        saveHistory(mom, MomAction.SUBMIT, MomStatus.DRAFT, MomStatus.SUBMITTED, 
                    MomStage.SCHOLAR, MomStage.GUIDE, scholarId, "Submitted for review");

        // Notify Supervisor
        User supervisor = userRepository.findById(mom.getSupervisorId())
                .orElseThrow(() -> new RuntimeException("Supervisor not found"));
        notificationService.createNotification(
                supervisor.getId(), supervisor.getRole().name(), mom.getId(),
                "New MoM Submitted", 
                "Scholar " + mom.getScholarName() + " has submitted a new MoM for your review.",
                "SUBMIT"
        );

        return mom;
    }

    // --- 2. SUPERVISOR (GUIDE) ACTIONS ---
    @Transactional
    public MinutesOfMeeting guideAction(Long momId, Long guideId, String action, String remarks, 
                                        String month, String assessmentScores) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        mom.setSectionHMonth(month);
        mom.setSectionHAssessmentScores(assessmentScores);
        mom.setSectionHRecommendation(action.equals("RECOMMEND") ? "Recommended" : "Returned with remarks");
        momRepository.save(mom);

        if ("RECOMMEND".equalsIgnoreCase(action)) {
            mom.setCurrentStatus(MomStatus.GUIDE_RECOMMENDED);
            mom.setCurrentStage(MomStage.COORDINATOR);
            momRepository.save(mom);
            
            saveHistory(mom, MomAction.GUIDE_RECOMMEND, MomStatus.SUBMITTED, MomStatus.GUIDE_RECOMMENDED, 
                        MomStage.GUIDE, MomStage.COORDINATOR, guideId, remarks);
            
            // Notify Coordinator
            User coordinator = userRepository.findAllByRole(Role.INSTITUTIONAL_RESEARCH_COORDINATOR).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            notificationService.createNotification(
                    coordinator.getId(), coordinator.getRole().name(), mom.getId(),
                    "MoM Pending Review", 
                    "MoM " + mom.getMomNumber() + " has been recommended by the Supervisor and is pending your review.",
                    "GUIDE_RECOMMEND"
            );
        } else {
            mom.setCurrentStatus(MomStatus.GUIDE_RETURNED);
            mom.setCurrentStage(MomStage.SCHOLAR);
            momRepository.save(mom);
            
            saveHistory(mom, MomAction.GUIDE_RETURN, MomStatus.SUBMITTED, MomStatus.GUIDE_RETURNED, 
                        MomStage.GUIDE, MomStage.SCHOLAR, guideId, remarks);
            
            // Notify Scholar
            notificationService.createNotification(
                    mom.getScholarId(), Role.SCHOLAR.name(), mom.getId(),
                    "MoM Returned", 
                    "Your MoM " + mom.getMomNumber() + " has been returned by the Supervisor. Remarks: " + remarks,
                    "GUIDE_RETURN"
            );
        }
        return mom;
    }

    // --- 3. COORDINATOR ACTIONS ---
    @Transactional
    public MinutesOfMeeting coordinatorAction(Long momId, Long coordId, String action, String remarks) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        if ("RECOMMEND".equalsIgnoreCase(action)) {
            mom.setCurrentStatus(MomStatus.COORDINATOR_RECOMMENDED);
            mom.setCurrentStage(MomStage.HEAD_OF_INSTITUTE);
            momRepository.save(mom);

            saveHistory(mom, MomAction.COORDINATOR_RECOMMEND, MomStatus.GUIDE_RECOMMENDED, MomStatus.COORDINATOR_RECOMMENDED, 
                        MomStage.COORDINATOR, MomStage.HEAD_OF_INSTITUTE, coordId, remarks);

            // Notify HOI
            User hoi = userRepository.findAllByRole(Role.HEAD_OF_INSTITUTE).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("HOI not found"));
            notificationService.createNotification(
                    hoi.getId(), hoi.getRole().name(), mom.getId(),
                    "MoM Pending Endorsement", 
                    "MoM " + mom.getMomNumber() + " has been recommended by the Coordinator and is pending your endorsement.",
                    "COORDINATOR_RECOMMEND"
            );
        } else {
            mom.setCurrentStatus(MomStatus.COORDINATOR_RETURNED);
            mom.setCurrentStage(MomStage.SCHOLAR);
            momRepository.save(mom);

            saveHistory(mom, MomAction.COORDINATOR_RETURN, MomStatus.GUIDE_RECOMMENDED, MomStatus.COORDINATOR_RETURNED, 
                        MomStage.COORDINATOR, MomStage.SCHOLAR, coordId, remarks);

            // Notify Scholar
            notificationService.createNotification(
                    mom.getScholarId(), Role.SCHOLAR.name(), mom.getId(),
                    "MoM Returned", 
                    "Your MoM " + mom.getMomNumber() + " has been returned by the Coordinator. Remarks: " + remarks,
                    "COORDINATOR_RETURN"
            );
        }
        return mom;
    }

    // --- 4. HEAD OF INSTITUTE (HOI) ACTIONS ---
    @Transactional
    public MinutesOfMeeting hoiAction(Long momId, Long hoiId, String action, String remarks, 
                                      String certifiedLeave, String certifiedFellowship) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        mom.setSectionICertifiedLeave(certifiedLeave);
        mom.setSectionICertifiedFellowship(certifiedFellowship);
        mom.setSectionIHoiRemarks(remarks);
        momRepository.save(mom);

        if ("RECOMMEND".equalsIgnoreCase(action)) {
            mom.setCurrentStatus(MomStatus.HOI_RECOMMENDED);
            mom.setCurrentStage(MomStage.DEAN_RESEARCH);
            momRepository.save(mom);

            saveHistory(mom, MomAction.HOI_RECOMMEND, MomStatus.COORDINATOR_RECOMMENDED, MomStatus.HOI_RECOMMENDED, 
                        MomStage.HEAD_OF_INSTITUTE, MomStage.DEAN_RESEARCH, hoiId, remarks);

            // Notify Dean
            User dean = userRepository.findAllByRole(Role.DEAN_RESEARCH).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Dean not found"));
            notificationService.createNotification(
                    dean.getId(), dean.getRole().name(), mom.getId(),
                    "MoM Pending Approval", 
                    "MoM " + mom.getMomNumber() + " has been endorsed by the HOI and is pending your final approval.",
                    "HOI_RECOMMEND"
            );
        } else {
            mom.setCurrentStatus(MomStatus.HOI_RETURNED);
            mom.setCurrentStage(MomStage.SCHOLAR);
            momRepository.save(mom);

            saveHistory(mom, MomAction.HOI_RETURN, MomStatus.COORDINATOR_RECOMMENDED, MomStatus.HOI_RETURNED, 
                        MomStage.HEAD_OF_INSTITUTE, MomStage.SCHOLAR, hoiId, remarks);

            // Notify Scholar
            notificationService.createNotification(
                    mom.getScholarId(), Role.SCHOLAR.name(), mom.getId(),
                    "MoM Returned", 
                    "Your MoM " + mom.getMomNumber() + " has been returned by the HOI. Remarks: " + remarks,
                    "HOI_RETURN"
            );
        }
        return mom;
    }

    // --- 5. DEAN RESEARCH ACTIONS ---
    @Transactional
    public MinutesOfMeeting deanAction(Long momId, Long deanId, String action, String remarks) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));

        mom.setSectionIDeanRemarks(remarks);
        
        if ("APPROVE".equalsIgnoreCase(action)) {
            mom.setCurrentStatus(MomStatus.DEAN_APPROVED);
            mom.setCurrentStage(MomStage.COMPLETED);
        } else {
            mom.setCurrentStatus(MomStatus.DEAN_REJECTED);
            mom.setCurrentStage(MomStage.COMPLETED);
        }
        momRepository.save(mom);

        saveHistory(mom, action.equals("APPROVE") ? MomAction.DEAN_APPROVE : MomAction.DEAN_REJECT, 
                    MomStatus.HOI_RECOMMENDED, mom.getCurrentStatus(), 
                    MomStage.DEAN_RESEARCH, MomStage.COMPLETED, deanId, remarks);

        // Notify Scholar, Guide, Coordinator, HOI
        String msg = "MoM " + mom.getMomNumber() + " has been " + 
                     (action.equals("APPROVE") ? "APPROVED" : "REJECTED") + " by the Dean Research. Remarks: " + remarks;
        
        notificationService.createNotification(mom.getScholarId(), Role.SCHOLAR.name(), mom.getId(), "MoM " + action, msg, "DEAN_ACTION");
        notificationService.createNotification(mom.getSupervisorId(), Role.SUPERVISOR.name(), mom.getId(), "MoM " + action, msg, "DEAN_ACTION");
        
        userRepository.findAllByRole(Role.INSTITUTIONAL_RESEARCH_COORDINATOR).stream().findFirst().ifPresent(c -> 
            notificationService.createNotification(c.getId(), c.getRole().name(), mom.getId(), "MoM " + action, msg, "DEAN_ACTION"));
        userRepository.findAllByRole(Role.HEAD_OF_INSTITUTE).stream().findFirst().ifPresent(h -> 
            notificationService.createNotification(h.getId(), h.getRole().name(), mom.getId(), "MoM " + action, msg, "DEAN_ACTION"));

        return mom;
    }

    // --- HELPERS ---
    public List<MinutesOfMeeting> getPendingMomsForStage(MomStage stage) {
        return momRepository.findByCurrentStage(stage);
    }

    public Optional<MinutesOfMeeting> getMomById(Long id) {
        return momRepository.findById(id);
    }

    @Transactional
    public void signMom(Long momId, Long userId, String role, String typedName) {
        MinutesOfMeeting mom = momRepository.findById(momId)
                .orElseThrow(() -> new RuntimeException("MoM not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MomSignature signature = MomSignature.builder()
                .momId(momId)
                .role(role)
                .signedByUserId(userId)
                .signedByName(typedName)
                .signatureHash(generateHash(momId, userId, typedName))
                .signedAt(LocalDateTime.now())
                .build();
        momSignatureRepository.save(signature);
    }

    private void saveHistory(MinutesOfMeeting mom, MomAction action, MomStatus prevStatus, MomStatus newStatus, 
                             MomStage prevStage, MomStage newStage, Long userId, String remarks) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        MomHistory history = MomHistory.builder()
                .momId(mom.getId())
                .action(action)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .previousStage(prevStage)
                .newStage(newStage)
                .performedByUserId(userId)
                .performedByUsername(user.getUsername())
                .performedByRole(user.getRole().name())
                .remarks(remarks)
                .actionTimestamp(LocalDateTime.now())
                .build();
        momHistoryRepository.save(history);
    }

    private String generateHash(Long momId, Long userId, String typedName) {
        return java.util.Base64.getEncoder().encodeToString(
            (momId + "|" + userId + "|" + typedName + "|" + System.currentTimeMillis()).getBytes()
        );
    }

            public void updateSectionsAtoG(MinutesOfMeeting mom, MomFormDTO dto, User scholar) {
        if (dto.getPeriodYear() != null) mom.setPeriodYear(dto.getPeriodYear());
        if (dto.getPeriodMonth() != null) mom.setPeriodMonth(dto.getPeriodMonth());

        mom.setSectionAScholarName(dto.getSectionAScholarName() != null ? dto.getSectionAScholarName() : scholar.getFullName());
        mom.setSectionARegistrationDate(dto.getSectionARegistrationDate());
        mom.setSectionASessionYear(dto.getSectionASessionYear());
        mom.setSectionASupervisorName(dto.getSectionASupervisorName());
        mom.setSectionACosupervisorName(dto.getSectionACosupervisorName());
        mom.setSectionADepartment(dto.getSectionADepartment());
        mom.setSectionAScopusId(dto.getSectionAScopusId());
        mom.setSectionAOrcidId(dto.getSectionAOrcidId());
        mom.setSectionALinked(dto.getSectionALinked());
        mom.setSectionAPhdTitle(dto.getSectionAPhdTitle());
        mom.setSectionAFunding(dto.getSectionAFunding());
        mom.setSectionAJrfSrf(dto.getSectionAJrfSrf());
        mom.setSectionAProjectTitle(dto.getSectionAProjectTitle());
        mom.setSectionAFundingAgency(dto.getSectionAFundingAgency());
        mom.setSectionAPiName(dto.getSectionAPiName());

        mom.setSectionBCourseworkCompleted(dto.getSectionBCourseworkCompleted());
        mom.setSectionBCourseworksRecommended(dto.getSectionBCourseworksRecommended());

        try {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            if (dto.getSectionCMilestones() != null) mom.setSectionCMilestones(om.writeValueAsString(dto.getSectionCMilestones()));
            if (dto.getSectionDThroughputs() != null) mom.setSectionDThroughputs(om.writeValueAsString(dto.getSectionDThroughputs()));
            if (dto.getSectionESkills() != null) mom.setSectionESkills(om.writeValueAsString(dto.getSectionESkills()));
            if (dto.getSectionFChallenges() != null) mom.setSectionFChallenges(om.writeValueAsString(dto.getSectionFChallenges()));
            if (dto.getSectionFParticipation() != null) mom.setSectionFParticipation(om.writeValueAsString(dto.getSectionFParticipation()));
            if (dto.getSectionFPlannedActivities() != null) mom.setSectionFPlannedActivities(om.writeValueAsString(dto.getSectionFPlannedActivities()));
        } catch (Exception ignored) {}

        mom.setSectionGLabHours(dto.getSectionGLabHours());
        mom.setSectionGTutorialHours(dto.getSectionGTutorialHours());
        mom.setSectionGSupport(dto.getSectionGSupport());
        mom.setSectionGRemarks(dto.getSectionGRemarks());
    }
}