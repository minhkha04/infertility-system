package com.emmkay.infertility_system_api.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentRecordResponse {
    Long id;
    String customerId;
    String customerName;
    String doctorName;
    String treatmentServiceName;
    LocalDate startDate;
    LocalDate endDate;
    String status;
    LocalDate createdDate;
    List<TreatmentStepResponse> treatmentSteps;
    boolean isPaid;
}
