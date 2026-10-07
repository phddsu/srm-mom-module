package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.MinutesOfMeeting;
import com.srm.phd.mom.entity.MomStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MomRepository extends JpaRepository<MinutesOfMeeting, Long> {
    List<MinutesOfMeeting> findByCurrentStage(MomStage stage);
    List<MinutesOfMeeting> findByScholarIdOrderByCreatedAtDesc(Long scholarId);
    List<MinutesOfMeeting> findBySupervisorIdOrderByCreatedAtDesc(Long supervisorId);
    Optional<MinutesOfMeeting> findByMomNumber(String momNumber);
}