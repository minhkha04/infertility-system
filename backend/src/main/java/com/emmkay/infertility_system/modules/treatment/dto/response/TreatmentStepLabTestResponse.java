package com.emmkay.infertility_system.modules.treatment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStepLabTestResponse {
    Integer id;
    String testName;
    String notes;
    String result;
}
