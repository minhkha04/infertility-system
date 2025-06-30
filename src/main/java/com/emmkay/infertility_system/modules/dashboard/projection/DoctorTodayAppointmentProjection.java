package com.emmkay.infertility_system.modules.dashboard.projection;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.shared.enums.Shift;

public interface DoctorTodayAppointmentProjection {
    Long getId();
    String getCustomerName();
    AppointmentStatus getStatus();
    Shift getShift();
}
