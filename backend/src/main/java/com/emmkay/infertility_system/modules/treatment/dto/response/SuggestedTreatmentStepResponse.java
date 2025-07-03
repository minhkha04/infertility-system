package com.emmkay.infertility_system.modules.treatment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SuggestedTreatmentStepResponse {
    String name;
    String expectedRange;
    LocalDate from;
    LocalDate to;
}
