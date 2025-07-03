package com.emmkay.infertility_system.modules.treatment.dto.response;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepResponse {
    long id;
    String name;
    LocalDate startDate;
    LocalDate endDate;
    String notes;
    TreatmentStepStatus status;
    int orderIndex;
    long treatmentStageId;
}
