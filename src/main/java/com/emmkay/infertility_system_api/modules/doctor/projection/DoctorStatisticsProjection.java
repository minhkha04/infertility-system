package com.emmkay.infertility_system_api.modules.doctor.projection;

public interface DoctorStatisticsProjection {
    Double getAvgRating();
    Integer getPatients();
    Integer getWorkShiftsThisMonth();
}
