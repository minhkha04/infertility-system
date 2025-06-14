package com.emmkay.infertility_system_api.dto.projection;

import java.time.LocalDate;

public interface AppointmentInNext7DayProjection {
    Integer getTotalAppointment();
    LocalDate getAppointmentDate();
}
