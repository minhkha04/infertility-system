package com.emmkay.infertility_system.modules.treatment.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TreatmentStageResponse {
    long id;
    long serviceId;
    String serviceName;
    String name;
    String description;
    String expectedDayRange;
    int orderIndex;
}
