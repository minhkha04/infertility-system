package com.emmkay.infertility_system_api.dto.response;

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
    Integer id;
    Integer typeId;
    String typeName;
    String name;
    String description;
    String expectedDayRange;
    Integer orderIndex;
}
