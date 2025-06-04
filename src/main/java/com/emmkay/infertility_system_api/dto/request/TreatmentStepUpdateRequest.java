package com.emmkay.infertility_system_api.dto.request;

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
    String status;
    String notes;
}
