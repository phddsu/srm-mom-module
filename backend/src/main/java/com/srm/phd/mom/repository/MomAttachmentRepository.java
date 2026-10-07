package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.MomAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomAttachmentRepository extends JpaRepository<MomAttachment, Long> {
    List<MomAttachment> findByMomId(Long momId);
}