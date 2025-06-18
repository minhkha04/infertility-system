package com.emmkay.infertility_system_api.modules.treatment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentServiceResponse {
    int id;
    String name;
    String description;
    double price;
    int duration;
    int treatmentTypeId;
    String treatmentTypeName;
    String createdBy;
    boolean isRemove;
}
