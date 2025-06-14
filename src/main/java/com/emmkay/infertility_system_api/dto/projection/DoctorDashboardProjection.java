package com.emmkay.infertility_system_api.dto.projection;

public interface DoctorDashboardProjection {
    Double getAvgRating();
    Integer getPatients();
    Integer getWorkShiftsThisMonth();
}
