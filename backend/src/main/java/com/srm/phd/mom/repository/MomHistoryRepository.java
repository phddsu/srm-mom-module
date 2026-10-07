package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.MomHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomHistoryRepository extends JpaRepository<MomHistory, Long> {
    List<MomHistory> findByMomIdOrderByActionTimestampAsc(Long momId);
}