package com.emmkay.infertility_system.modules.treatment.mapper;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepLabTestResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStepLabTest;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentStepLabTestMapper {

    TreatmentStepLabTest toTreatmentStepLabTest(TreatmentStepLabTestCreateRequest request);

    void updateTreatmentStepLabTest(@MappingTarget TreatmentStepLabTest treatmentStepLabTest, TreatmentStepLabTestUpdateRequest request);

    TreatmentStepLabTestResponse toTreatmentStepResponse(TreatmentStepLabTest treatmentStepLabTest) ;

}
