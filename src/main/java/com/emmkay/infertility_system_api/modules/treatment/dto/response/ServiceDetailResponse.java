package com.emmkay.infertility_system_api.modules.treatment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceDetailResponse {
    Long serviceId;
    String serviceName;
    String typeName;
    String description;
    String coverImageUrl;
    Double price;
    Integer duration;
    List<TreatmentStageResponse> treatmentStageResponses;
}

