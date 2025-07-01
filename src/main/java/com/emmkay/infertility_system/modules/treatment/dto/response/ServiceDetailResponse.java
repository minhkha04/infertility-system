package com.emmkay.infertility_system.modules.treatment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceDetailResponse {
    long serviceId;
    String serviceName;
    String description;
    String coverImageUrl;
    double price;
    int duration;
    List<TreatmentStageResponse> treatmentStageResponses;
}

