package com.emmkay.infertility_system_api.modules.appointment.dto.request;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConfirmChangeAppointmentRequest {
    @NotNull(message = "{validation.required}")
    AppointmentStatus status;
    String notes;
}
