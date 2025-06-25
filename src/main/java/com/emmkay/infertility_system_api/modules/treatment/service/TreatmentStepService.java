package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.SuggestedTreatmentStepResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.helper.TreatmentStageHelper;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentStepMapper;
import com.emmkay.infertility_system_api.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system_api.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStepRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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
    AppointmentRepository appointmentRepository;
    ReminderRepository reminderRepository;

    public List<SuggestedTreatmentStepResponse> getSuggestedSteps(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentService treatmentService = treatmentServiceRepository.getTreatmentServicesById(treatmentRecord.getService().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));
        Long typeId = treatmentService.getType().getId();
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

    @Transactional
    public void cancelStepsByRecordId(Long recordId) {
        List<String> cancellableStatuses = List.of("PLANNED", "CONFIRMED", "COMPLETED");
        treatmentStepRepository.updateStatusByRecordIdAndStatusIn(
                recordId,  cancellableStatuses, "CANCELLED"
        );
        List<TreatmentStep> treatmentStepList = treatmentStepRepository.findByRecord_Id(recordId);
        treatmentStepList.forEach(x -> {
            x.getAppointments().forEach(reminderRepository::deleteByAppointment);
            appointmentRepository.updateStatusByTreatmentStep("CANCELLED", x);
        });
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
        request.setStatus(request.getStatus().toUpperCase());
        if (treatmentStep.getStatus().equals("COMPLETED")) {

            List<String> statuses = List.of("CONFIRMED", "PENDING_CHANGE", "REJECTED", "PLANNED");
            boolean hasUnprocessedAppointments  = appointmentRepository.existsByStatusInAndTreatmentStep(statuses, treatmentStep);
            if (hasUnprocessedAppointments ) {
                throw new AppException(ErrorCode.TREATMENT_CAN_NOT_DONE);
            }

            TreatmentStage stage = treatmentStep.getStage();
            int currentOder = stage.getOrderIndex();
            if (currentOder > 1) {
                Optional<TreatmentStep> prevStepOpt = treatmentStepRepository.findByRecord_IdAndStageOrderIndex(treatmentStep.getRecord().getId(), currentOder - 1);

                if (prevStepOpt.isPresent()) {
                    String prevStepStatus = prevStepOpt.get().getStatus();
                    if (!prevStepStatus.equals("COMPLETED") && !prevStepStatus.equals("CANCELLED")) {
                        throw new AppException(ErrorCode.TREATMENT_CAN_NOT_DONE);
                    }
                }
            }
        }
        treatmentStepMapper.updateTreatmentStep(treatmentStep, request);
        return treatmentStepMapper.toTreatmentStepResponse(treatmentStepRepository.save(treatmentStep));
    }

}
