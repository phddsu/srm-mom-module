package com.srm.phd.mom.dto;

import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String department;
    private String designation;
    private String phone;
    private String officeLocation;
    private String avatarUrl;
    private String role;
}