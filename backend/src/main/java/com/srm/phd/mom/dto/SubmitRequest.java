package com.srm.phd.mom.dto;

import lombok.Data;

@Data
public class SubmitRequest {
    private String typedName;
    private Boolean confirmed;
}