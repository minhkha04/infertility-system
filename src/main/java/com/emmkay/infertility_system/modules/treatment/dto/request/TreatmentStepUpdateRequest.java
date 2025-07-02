package com.emmkay.infertility_system.modules.treatment.dto.request;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepUpdateRequest {

    @NotBlank(message = "{validation.required}")
    LocalDate startDate;
    @NotBlank(message = "{validation.required}")
    LocalDate endDate;
    @NotBlank(message = "{validation.required}")
    TreatmentStepStatus status;
    String notes;
}
