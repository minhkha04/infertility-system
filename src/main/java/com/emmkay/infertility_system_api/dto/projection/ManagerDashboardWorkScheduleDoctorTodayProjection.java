package com.emmkay.infertility_system_api.dto.projection;

public interface ManagerDashboardWorkScheduleDoctorTodayProjection {
    String getDoctorName();
    String getDoctorId();
    String getShift();
    String getPhoneNumber();
    int getTotalAppointments();
    int getCompletedAppointments();
}
