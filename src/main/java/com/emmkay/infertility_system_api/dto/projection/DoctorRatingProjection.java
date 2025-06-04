package com.emmkay.infertility_system_api.dto.projection;


public interface DoctorRatingProjection {
    String getId();
    String getFullName();
    String getAvatarUrl();
    String getQualifications();
    Integer getExperienceYears();
    String getSpecialty();
    Double getRate();
}
