package com.emmkay.infertility_system_api.modules.dashboard.projection;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system_api.modules.shared.enums.Shift;

public interface DoctorTodayAppointmentProjection {
    Long getId();
    String getCustomerName();
    AppointmentStatus getStatus();
    Shift getShift();
}
