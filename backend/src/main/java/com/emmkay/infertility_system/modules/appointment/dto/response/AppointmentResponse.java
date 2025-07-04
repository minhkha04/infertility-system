package com.emmkay.infertility_system.modules.appointment.dto.response;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
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
    LocalDate appointmentDate;
    Shift shift;
    AppointmentStatus status;
    String notes;
    Shift requestedShift;
    LocalDate requestedDate;
    LocalDate createdAt;
    String customerName;
    String customerEmail;
    String doctorName;
    String doctorEmail;
    String purpose;
    String step;
}
