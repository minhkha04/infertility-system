package com.emmkay.infertility_system.modules.treatment.dto.request;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepUpdateRequest {
    LocalDate scheduledDate;
    LocalDate actualDate;
    TreatmentStepStatus status;
    String notes;
}
