package com.emmkay.infertility_system.modules.dashboard.projection;

public interface ManagerWorkScheduleDoctorTodayProjection {
    String getDoctorName();
    String getDoctorId();
    String getShift();
    String getPhoneNumber();
    Integer getTotalAppointments();
    Integer getCompletedAppointments();
    String getAvatarUrl();
}
