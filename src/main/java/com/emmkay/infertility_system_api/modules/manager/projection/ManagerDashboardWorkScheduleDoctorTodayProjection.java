package com.emmkay.infertility_system_api.modules.manager.projection;

public interface ManagerDashboardWorkScheduleDoctorTodayProjection {
    String getDoctorName();
    String getDoctorId();
    String getShift();
    String getPhoneNumber();
    Integer getTotalAppointments();
    Integer getCompletedAppointments();
}
