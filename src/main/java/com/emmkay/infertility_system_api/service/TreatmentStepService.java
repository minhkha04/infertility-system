package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.entity.TreatmentStage;
import com.emmkay.infertility_system_api.entity.TreatmentStep;
import com.emmkay.infertility_system_api.mapper.TreatmentStepMapper;
import com.emmkay.infertility_system_api.repository.TreatmentStepRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepService {

    TreatmentStepRepository treatmentStepRepository;
    TreatmentStepMapper treatmentStepMapper;

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

//    public List<TreatmentStepResponse> getStepsByRecordId(Long recordId) {
//        return treatmentStepRepository.findByRecordIdAndOrderByOr(recordId)
//                .stream()
//                .map(treatmentStepMapper::toTreatmentStepResponse)
//                .toList();
//    }

}
