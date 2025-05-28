package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.TreatmentServiceCreationRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system_api.entity.TreatmentService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentServiceMapper {

    TreatmentService toTreatmentService(TreatmentServiceCreationRequest request);

    void updateTreatmentService(@MappingTarget TreatmentService treatmentService, TreatmentServiceUpdateRequest request );

    @Mapping(target = "treatmentTypeId", source = "type.id")
    @Mapping(target = "treatmentTypeName", source = "type.name")
    @Mapping(target = "createdBy", source = "createdBy.fullName")
    TreatmentServiceResponse toTreatmentServiceResponse(TreatmentService treatmentService);
}
