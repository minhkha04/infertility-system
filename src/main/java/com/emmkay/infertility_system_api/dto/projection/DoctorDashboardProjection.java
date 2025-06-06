package com.emmkay.infertility_system_api.dto.projection;

public interface DoctorDashboardProjection {
    double getAvgRating();
    int getPatients();
    int getWorkShiftsThisMonth();
}
