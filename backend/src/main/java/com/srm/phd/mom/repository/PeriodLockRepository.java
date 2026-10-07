package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.PeriodLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PeriodLockRepository extends JpaRepository<PeriodLock, Long> {
    Optional<PeriodLock> findByPeriodYearAndPeriodMonth(Integer periodYear, Integer periodMonth);
}