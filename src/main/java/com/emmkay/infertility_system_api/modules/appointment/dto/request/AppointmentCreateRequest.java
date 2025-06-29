package com.emmkay.infertility_system_api.modules.appointment.dto.request;

import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentCreateRequest {
    @NotNull(message = "{validation.required}")
    Long treatmentStepId;
    @NotNull(message = "{validation.required}")
    Shift shift;
    @NotBlank(message = "{validation.required}")
    String customerId;
    @NotBlank(message = "{validation.required}")
    String doctorId;
    @NotNull(message = "{validation.required}")
    LocalDate appointmentDate;
    String notes;
    @NotNull(message = "{validation.required}")
    String purpose;

}
