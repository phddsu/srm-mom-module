package com.srm.phd.mom.service;

import com.srm.phd.mom.repository.MomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MomNumberService {

    private final MomRepository momRepository;

    public synchronized String generateMomNumber(int year, int month) {
        String prefix = String.format("SRM/MoM/%d/%02d/", year, month);
        long count = momRepository.count() + 1;
        String candidate;
        int seq = (int) count;

        do {
            candidate = prefix + String.format("%04d", seq);
            seq++;
        } while (momRepository.findByMomNumber(candidate).isPresent());

        return candidate;
    }

    public String generateCurrentMomNumber() {
        LocalDate now = LocalDate.now();
        return generateMomNumber(now.getYear(), now.getMonthValue());
    }
}