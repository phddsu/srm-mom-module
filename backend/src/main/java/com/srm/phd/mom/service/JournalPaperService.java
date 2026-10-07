package com.srm.phd.mom.service;

import com.srm.phd.mom.entity.JournalPaper;
import com.srm.phd.mom.repository.JournalPaperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalPaperService {

    private final JournalPaperRepository journalPaperRepository;

    public List<JournalPaper> getPapersByMomId(Long momId) {
        return journalPaperRepository.findByMomId(momId);
    }

    @Transactional
    public JournalPaper savePaper(JournalPaper paper) {
        return journalPaperRepository.save(paper);
    }

    @Transactional
    public void deletePaper(Long paperId) {
        journalPaperRepository.deleteById(paperId);
    }
}