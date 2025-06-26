package com.emmkay.infertility_system_api.modules.appointment.projection;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;

import java.time.LocalDate;

public interface AppointmentBasicProjection {
    Long getId();
    String getCustomerName();
    String getDoctorName();
    LocalDate getAppointmentDate();
    String getShift();
    AppointmentStatus getStatus();
}
