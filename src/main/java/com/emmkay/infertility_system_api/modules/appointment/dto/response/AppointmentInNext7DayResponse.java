package com.emmkay.infertility_system_api.modules.appointment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentInNext7DayResponse {
    int totalAppointment;
    LocalDate appointmentDate;
}
