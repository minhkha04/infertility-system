package com.emmkay.infertility_system_api.modules.appointment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse {
    Long id;
    String purpose;
    LocalDate appointmentDate;
    String shift;
    String status;
    String notes;
    String requestedShift;
    LocalDate requestedDate;
    LocalDate createdAt;

    String customerName;
    String customerEmail;

    String doctorName;
    String doctorEmail;
}
