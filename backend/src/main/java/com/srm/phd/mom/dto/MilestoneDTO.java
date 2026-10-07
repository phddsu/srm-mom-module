package com.srm.phd.mom.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MilestoneDTO {
    private String name;
    private String status;
    private LocalDate expectedCompletionDate;
}