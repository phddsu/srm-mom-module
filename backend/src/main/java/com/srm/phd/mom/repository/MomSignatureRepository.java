package com.srm.phd.mom.repository;

import com.srm.phd.mom.entity.MomSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomSignatureRepository extends JpaRepository<MomSignature, Long> {
    List<MomSignature> findByMomId(Long momId);
    List<MomSignature> findByMomIdOrderBySignedAtAsc(Long momId);
}