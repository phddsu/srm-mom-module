package com.srm.phd.mom.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PlannedActivityDTO {
    private String activityName;
    private LocalDate targetDate;
}