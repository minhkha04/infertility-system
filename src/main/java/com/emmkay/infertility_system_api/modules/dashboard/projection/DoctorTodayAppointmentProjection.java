package com.emmkay.infertility_system_api.modules.dashboard.projection;

public interface DoctorTodayAppointmentProjection {
    Long getId();
    String getCustomerName();
    String getStatus();
    String getShift();
}
