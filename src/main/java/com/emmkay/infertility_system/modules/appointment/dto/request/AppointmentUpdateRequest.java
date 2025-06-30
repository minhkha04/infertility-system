package com.emmkay.infertility_system.modules.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentUpdateRequest {

    @NotBlank(message = "{validation.required}")
    String notes;

    @NotBlank(message = "{validation.required}")
    String purpose;

    @NotBlank(message = "{validation.required}")
    String doctorId;
}
