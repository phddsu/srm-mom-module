package com.srm.phd.mom.service;

import com.srm.phd.mom.entity.PeriodLock;
import com.srm.phd.mom.repository.PeriodLockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PeriodLockService {

    private final PeriodLockRepository periodLockRepository;

    public boolean isPeriodLocked(int year, int month) {
        return periodLockRepository.findByPeriodYearAndPeriodMonth(year, month)
                .map(PeriodLock::getIsLocked)
                .orElse(false);
    }

    public boolean isDeadlinePassed(int year, int month) {
        return periodLockRepository.findByPeriodYearAndPeriodMonth(year, month)
                .map(lock -> LocalDate.now().isAfter(lock.getDeadline()))
                .orElse(false);
    }

    public PeriodLock getPeriodLock(int year, int month) {
        return periodLockRepository.findByPeriodYearAndPeriodMonth(year, month)
                .orElseThrow(() -> new RuntimeException("Period lock not found for " + year + "-" + month));
    }
}