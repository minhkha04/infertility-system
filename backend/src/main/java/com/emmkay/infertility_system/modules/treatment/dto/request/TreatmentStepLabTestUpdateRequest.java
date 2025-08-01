package com.emmkay.infertility_system.modules.treatment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepLabTestUpdateRequest {
    @NotBlank(message = "{validation.required}")
    String testName;
    String notes;
    String result;
}
