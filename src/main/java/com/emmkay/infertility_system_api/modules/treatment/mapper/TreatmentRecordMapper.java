package com.emmkay.infertility_system_api.modules.treatment.mapper;

import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TreatmentRecordMapper {

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "doctorName", source = "doctor.users.fullName")
    @Mapping(target = "treatmentServiceName", source = "service.name")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "treatmentSteps", ignore = true)
    TreatmentRecordResponse toTreatmentRecordResponse(TreatmentRecord request);
}
