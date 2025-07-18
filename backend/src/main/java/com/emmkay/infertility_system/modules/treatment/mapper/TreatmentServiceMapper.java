package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentServiceMapper {

    TreatmentService toTreatmentService(TreatmentServiceCreateRequest request);

    void updateTreatmentService(@MappingTarget TreatmentService treatmentService, TreatmentServiceUpdateRequest request );

    @Mapping(target = "createdBy", source = "createdBy.fullName")
    TreatmentServiceResponse toTreatmentServiceResponse(TreatmentService treatmentService);
}
