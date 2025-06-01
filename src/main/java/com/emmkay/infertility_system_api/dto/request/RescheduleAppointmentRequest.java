package com.emmkay.infertility_system_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RescheduleAppointmentRequest {

    @NotNull(message = "{validation.required}")
    LocalDate appointmentDate;
    @NotBlank(message = "{validation.required}")
    String shift; // morning / afternoon

    String notes;
}
