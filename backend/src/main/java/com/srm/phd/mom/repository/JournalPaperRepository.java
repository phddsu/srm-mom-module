package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.JournalPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalPaperRepository extends JpaRepository<JournalPaper, Long> {
    List<JournalPaper> findByMomId(Long momId);
}