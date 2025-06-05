package com.emmkay.infertility_system_api.dto.projection;

import java.time.LocalDate;

public interface AppointmentInNext7DayProjection {
    int getTotalAppointment();
    LocalDate getAppointmentDate();
}
