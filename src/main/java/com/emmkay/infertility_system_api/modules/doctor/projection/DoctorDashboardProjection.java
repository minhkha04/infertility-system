package com.emmkay.infertility_system_api.modules.doctor.projection;

public interface DoctorDashboardProjection {
    Double getAvgRating();
    Integer getPatients();
    Integer getWorkShiftsThisMonth();
}
