package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.SuggestedTreatmentStepResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.entity.TreatmentService;
import com.emmkay.infertility_system_api.entity.TreatmentStage;
import com.emmkay.infertility_system_api.entity.TreatmentStep;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.helper.TreatmentStageHelper;
import com.emmkay.infertility_system_api.mapper.TreatmentStepMapper;
import com.emmkay.infertility_system_api.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.repository.TreatmentStepRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepService {

    TreatmentStepRepository treatmentStepRepository;
    TreatmentStepMapper treatmentStepMapper;
    TreatmentRecordRepository treatmentRecordRepository;
    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentStageRepository treatmentStageRepository;

    public List<SuggestedTreatmentStepResponse> getSuggestedSteps(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentService treatmentService = treatmentServiceRepository.getTreatmentServicesById(treatmentRecord.getService().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        int typeId = treatmentService.getType().getId();
        List<TreatmentStage> treatmentStages = treatmentStageRepository.findByTypeIdOrderByOrderIndexAsc(typeId);
        LocalDate cd1 = treatmentRecord.getCd1Date();
        return treatmentStages.stream()
                .map(x -> {
                    LocalDate[] range = TreatmentStageHelper.calculateDateRangeFromCd1(x.getExpectedDayRange(), cd1);
                    if (range[0] != null && range[1] != null) {
                        return SuggestedTreatmentStepResponse.builder()
                                .name(x.getName())
                                .from(range[0])
                                .to(range[1])
                                .expectedRange(x.getExpectedDayRange())
                                .build();
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .toList();
    }


    public List<TreatmentStepResponse> saveAll(List<TreatmentStep> steps) {
        return  treatmentStepRepository.saveAll(steps)
                .stream()
                .map(treatmentStepMapper::toTreatmentStepResponse)
                .toList();
    }

    public List<TreatmentStep> buildSteps(TreatmentRecord treatmentRecord, List<TreatmentStage> stages, LocalDate startDate) {
        List<TreatmentStep> steps = new ArrayList<>();
        stages.forEach(stage -> {
            TreatmentStep step = TreatmentStep.builder()
                    .record(treatmentRecord)
                    .stage(stage)
                    .stepType(stage.getName())
                    .status("PLANNED")
                    .build();
            if (stage.getOrderIndex() == 1) {
                step.setScheduledDate(startDate);
                step.setStatus("CONFIRMED");
            }
            steps.add(step);
        });
        return steps;
    }

    public void cancelStepsByRecordId(Long recordId) {
        List<String> cancellableStatuses = List.of("PLANNED", "CONFIRMED");
        treatmentStepRepository.updateStatusByRecordIdAndStatusIn(
                recordId,  cancellableStatuses, "CANCELLED"
        );
    }

    public List<TreatmentStepResponse> getStepsByRecordId(Long recordId) {
        return treatmentStepRepository.findByRecordIdOrderByIdAsc(recordId)
                .stream()
                .map(treatmentStepMapper::toTreatmentStepResponse)
                .toList();
    }

    public TreatmentStepResponse updateTreatmentStepById(Long id, TreatmentStepUpdateRequest request) {
        TreatmentStep treatmentStep = treatmentStepRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));

        treatmentStepMapper.updateTreatmentStep(treatmentStep, request);
        return treatmentStepMapper.toTreatmentStepResponse(treatmentStepRepository.save(treatmentStep));
    }

}
