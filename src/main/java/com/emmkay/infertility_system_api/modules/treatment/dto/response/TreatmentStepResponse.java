package com.emmkay.infertility_system_api.modules.treatment.dto.response;

import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentStepStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepResponse {
    Long id;
    String name;
    LocalDate scheduledDate;
    LocalDate actualDate;
    String notes;
    TreatmentStepStatus status;

}
