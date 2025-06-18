package com.emmkay.infertility_system_api.modules.treatment.mapper;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeCreateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentType;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentTypeMapper {

    TreatmentType toTreatmentType(TreatmentTypeCreateRequest request);

    void updateTreatmentType(@MappingTarget TreatmentType treatmentType, TreatmentTypeUpdateRequest request);

    TreatmentTypeResponse toTreatmentTypeResponse(TreatmentType treatmentType);
}
