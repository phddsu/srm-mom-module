package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.ScholarProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ScholarProfileRepository extends JpaRepository<ScholarProfile, Long> {
    Optional<ScholarProfile> findByUserId(Long userId);
    List<ScholarProfile> findByStatus(String status);
    List<ScholarProfile> findBySupervisorIdAndStatus(Long supervisorId, String status);
}
