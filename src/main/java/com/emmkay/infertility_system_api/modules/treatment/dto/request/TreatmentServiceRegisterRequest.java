package com.emmkay.infertility_system_api.modules.treatment.dto.request;

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
public class TreatmentServiceRegisterRequest {
    @NotBlank(message = "{validation.required}")
    String customerId;

    String doctorId;

    @NotNull(message = "{validation.required}")
    Long treatmentServiceId;

    @NotNull(message = "{validation.required}")
    LocalDate startDate;

    @NotBlank(message = "{validation.required}")
    String shift;

    LocalDate cd1Date;

}
