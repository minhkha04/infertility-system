package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system_api.entity.TreatmentStage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentStageMapper {

    @Mapping(target = "type", ignore = true)
    TreatmentStage toTreatmentStage(TreatmentStageCreateRequest request);


    @Mapping(target = "type", ignore = true)
    void updateTreatmentStage(@MappingTarget TreatmentStage treatmentStage, TreatmentStageUpdateRequest request);

    @Mapping(target = "typeId", source = "type.id")
    @Mapping(target = "typeName", source = "type.name")
    TreatmentStageResponse toTreatmentStageResponse(TreatmentStage treatmentStage);
}
