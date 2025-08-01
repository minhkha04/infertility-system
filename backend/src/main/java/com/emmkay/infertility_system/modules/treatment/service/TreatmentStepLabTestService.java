package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepLabTestResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStepLabTest;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentStepLabTestMapper;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStepLabTestRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStepRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepLabTestService {

    TreatmentStepLabTestRepository treatmentStepLabTestRepository;
    TreatmentStepRepository treatmentStepRepository;
    TreatmentStepLabTestMapper treatmentStepLabTestMapper;

    public TreatmentStepLabTestResponse save(TreatmentStepLabTestCreateRequest request) {
        TreatmentStep treatmentStep = treatmentStepRepository.findById(request.getTreatmentStepId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));
        if (treatmentStep.getStatus() == TreatmentStepStatus.COMPLETED || treatmentStep.getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.TREATMENT_STEP_COMPLETED_OR_CANCELLED);
        }
        TreatmentStepLabTest treatmentStepLabTest = treatmentStepLabTestMapper.toTreatmentStepLabTest(request);
        treatmentStepLabTest.setTreatmentStep(treatmentStep);
        treatmentStepLabTestRepository.save(treatmentStepLabTest);
        return treatmentStepLabTestMapper.toTreatmentStepResponse(treatmentStepLabTest);
    }

    public List<TreatmentStepLabTestResponse> getTreatmentStepLabTestByStepId(Long treatmentStepId) {
        TreatmentStep treatmentStep = treatmentStepRepository.findById(treatmentStepId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));
        List<TreatmentStepLabTest> labTests = treatmentStepLabTestRepository.findAllByTreatmentStep(treatmentStep);
        return labTests.stream().map(treatmentStepLabTestMapper::toTreatmentStepResponse).toList();
    }

    public TreatmentStepLabTestResponse update(Long TreatmentStepLabTestId, TreatmentStepLabTestUpdateRequest request) {
        TreatmentStepLabTest treatmentStepLabTest = treatmentStepLabTestRepository.findById(TreatmentStepLabTestId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_LAB_TEST_NOT_FOUND));
        if (treatmentStepLabTest.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED ||
            treatmentStepLabTest.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.TREATMENT_STEP_COMPLETED_OR_CANCELLED);
        }
        treatmentStepLabTestMapper.updateTreatmentStepLabTest(treatmentStepLabTest, request);
        treatmentStepLabTestRepository.save(treatmentStepLabTest);
        return treatmentStepLabTestMapper.toTreatmentStepResponse(treatmentStepLabTest);
    }

    public void delete(Long treatmentStepLabTestId) {
        treatmentStepLabTestRepository.deleteById(treatmentStepLabTestId);
    }
}
