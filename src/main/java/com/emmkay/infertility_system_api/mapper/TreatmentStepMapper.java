package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.entity.TreatmentStep;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.lang.annotation.Target;

@Mapper(componentModel = "spring")
public interface TreatmentStepMapper {

    @Mapping(target = "name", source = "stage.name")
    TreatmentStepResponse toTreatmentStepResponse(TreatmentStep treatmentStep);
}
