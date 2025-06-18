package com.emmkay.infertility_system_api.modules.treatment.mapper;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentStepMapper {

    @Mapping(target = "name", source = "stage.name")
    TreatmentStepResponse toTreatmentStepResponse(TreatmentStep treatmentStep);

    void updateTreatmentStep(@MappingTarget TreatmentStep treatmentStep, TreatmentStepUpdateRequest request);
}
