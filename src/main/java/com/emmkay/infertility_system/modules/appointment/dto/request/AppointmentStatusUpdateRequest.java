package com.emmkay.infertility_system.modules.appointment.dto.request;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentStatusUpdateRequest {

    @NotNull(message = "{validation.required}")
    AppointmentStatus status;

    @NotBlank(message = "{validation.required}")
    String note;
}
