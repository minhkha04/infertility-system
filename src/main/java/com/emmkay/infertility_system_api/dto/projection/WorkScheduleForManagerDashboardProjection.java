package com.emmkay.infertility_system_api.dto.projection;

public interface WorkScheduleForManagerDashboardProjection {
    String getDoctorName();
    String getDoctorId();
    String getShift();
    String phoneNumber();
    int getTotalAppointments();
    int getCompletedAppointments();
}
