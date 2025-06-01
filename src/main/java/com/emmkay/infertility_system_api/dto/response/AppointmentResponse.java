package com.emmkay.infertility_system_api.dto.response;

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
    String shift;
    String status;
    String notes;
    String purpose;
    String customerName;
}
