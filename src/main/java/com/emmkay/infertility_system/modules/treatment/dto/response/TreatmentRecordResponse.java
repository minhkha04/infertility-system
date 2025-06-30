package com.emmkay.infertility_system.modules.treatment.dto.response;

import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
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
    TreatmentRecordStatus status;
    LocalDate createdDate;
    Boolean isPaid;
    List<TreatmentStepResponse> treatmentSteps;
}
