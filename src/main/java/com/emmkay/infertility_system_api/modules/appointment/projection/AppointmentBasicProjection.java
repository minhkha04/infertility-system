package com.emmkay.infertility_system_api.modules.appointment.projection;

import java.time.LocalDate;

public interface AppointmentBasicProjection {
    Long getId();
    String getCustomerName();
    String getDoctorName();
    String getPurpose();
    LocalDate getAppointmentDate();
    String getShift();
    String getStatus();
}
