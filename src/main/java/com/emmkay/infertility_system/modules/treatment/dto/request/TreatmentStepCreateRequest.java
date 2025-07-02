package com.emmkay.infertility_system.modules.treatment.dto.request;

import com.emmkay.infertility_system.modules.shared.enums.Shift;
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
public class TreatmentStepCreateRequest {

    @NotBlank(message = "{validation.required}")
    Long stageId;
    @NotBlank(message = "{validation.required}")
    LocalDate startDate;
    @NotBlank(message = "{validation.required}")
    TreatmentStepStatus status;
    @NotBlank(message = "{validation.required}")
    Long treatmentRecordId;
    String notes;

    boolean isAuto;
    Shift shift;
    String purpose;
}
