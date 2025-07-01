package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentRecordUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentRecordMapper {

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "doctorName", source = "doctor.users.fullName")
    @Mapping(target = "treatmentServiceName", source = "service.name")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "treatmentSteps", ignore = true)
    @Mapping(target = "treatmentServiceId", source = "service.id")
    TreatmentRecordResponse toTreatmentRecordResponse(TreatmentRecord request);


    void updateTreatmentRecord(@MappingTarget TreatmentRecord treatmentRecord, TreatmentRecordUpdateRequest request);
}
