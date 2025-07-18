package com.emmkay.infertility_system.modules.doctor.projection;


public interface DoctorBasicProjection {
    String getId();
    String getFullName();
    String getAvatarUrl();
    String getQualifications();
    Integer getExperienceYears();
    String getSpecialty();
    Double getRate();
}
