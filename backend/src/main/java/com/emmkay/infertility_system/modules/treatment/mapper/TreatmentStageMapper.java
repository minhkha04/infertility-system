package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentStageMapper {

    @Mapping(target = "service", ignore = true)
    TreatmentStage toTreatmentStage(TreatmentStageCreateRequest request);


    void updateTreatmentStage(@MappingTarget TreatmentStage treatmentStage, TreatmentStageUpdateRequest request);

    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.name")
    TreatmentStageResponse toTreatmentStageResponse(TreatmentStage treatmentStage);
}
