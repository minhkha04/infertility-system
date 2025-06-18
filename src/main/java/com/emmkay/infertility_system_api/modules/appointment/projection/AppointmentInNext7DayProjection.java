package com.emmkay.infertility_system_api.modules.appointment.projection;

import java.time.LocalDate;

public interface AppointmentInNext7DayProjection {
    Integer getTotalAppointment();
    LocalDate getAppointmentDate();
}
