package com.emmkay.infertility_system_api.modules.appointment.projection;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system_api.modules.shared.enums.Shift;

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
