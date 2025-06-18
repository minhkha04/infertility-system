package com.emmkay.infertility_system_api.modules.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConfirmChangeAppointmentRequest {
    @NotBlank(message = "{validation.required}")
    String status;
    String notes;
}
