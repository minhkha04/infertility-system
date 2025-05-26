package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.TreatmentTypeCreationRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.entity.TreatmentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentTypeMapper {

    TreatmentType toTreatmentType(TreatmentTypeCreationRequest request);

    void updateTreatmentType(@MappingTarget TreatmentType treatmentType, TreatmentTypeUpdateRequest request);

    TreatmentTypeResponse toTreatmentTypeResponse(TreatmentType treatmentType);
}
