package com.emmkay.infertility_system.modules.appointment.projection;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.shared.enums.Shift;

import java.time.LocalDate;

public interface AppointmentBasicProjection {
    Long getId();
    String getCustomerName();
    String getDoctorName();
    LocalDate getAppointmentDate();
    Shift getShift();
    AppointmentStatus getStatus();
    String getStep();
    String getPurpose();
    Long getRecordId();
}
