package com.emmkay.infertility_system_api.dto.projection;

public interface DoctorDashBoardProjection {
    double getAvgRating();
    int getPatients();
    int getWorkShiftsThisMonth();
}
