package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.MomSectionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomSectionAttachmentRepository extends JpaRepository<MomSectionAttachment, Long> {
    List<MomSectionAttachment> findByMomId(Long momId);
    List<MomSectionAttachment> findByMomIdAndSection(Long momId, String section);
    List<MomSectionAttachment> findByMomIdAndSectionAndRowIndex(Long momId, String section, Integer rowIndex);
}