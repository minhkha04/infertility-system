package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.SuggestedTreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.helper.TreatmentStageHelper;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentStepMapper;
import com.emmkay.infertility_system.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStepRepository;
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
                    .status(TreatmentStepStatus.PLANNED)
                    .build();
            if (stage.getOrderIndex() == 1) {
                step.setScheduledDate(startDate);
                step.setStatus(TreatmentStepStatus.CONFIRMED);
            }
            steps.add(step);
        });
        return steps;
    }

    @Transactional
    public void cancelStepsByRecordId(Long recordId) {
        List<TreatmentStepStatus> cancellableStatuses = List.of(TreatmentStepStatus.PLANNED, TreatmentStepStatus.CONFIRMED, TreatmentStepStatus.COMPLETED);
        treatmentStepRepository.updateStatusByRecordIdAndStatusIn(
                recordId,  cancellableStatuses, TreatmentStepStatus.CANCELLED
        );
        List<TreatmentStep> treatmentStepList = treatmentStepRepository.findByRecord_Id(recordId);
        treatmentStepList.forEach(
                x -> {
                    reminderRepository.deleteByAppointment(x.getAppointment());
                }
        );
//        treatmentStepList.forEach(x -> {
//            x.getAppointments().forEach(reminderRepository::deleteByAppointment);
//            appointmentRepository.updateStatusByTreatmentStep(AppointmentStatus.CANCELLED, x);
//        });
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
        if (treatmentStep.getStatus() == TreatmentStepStatus.COMPLETED) {
            List<AppointmentStatus> appointmentStatuses = List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CHANGE, AppointmentStatus.REJECTED);
            boolean hasUnprocessedAppointments  = appointmentRepository.existsByStatusInAndTreatmentStep(appointmentStatuses, treatmentStep);
            if (hasUnprocessedAppointments ) {
                throw new AppException(ErrorCode.TREATMENT_CAN_NOT_DONE);
            }

            TreatmentStage stage = treatmentStep.getStage();
            int currentOder = stage.getOrderIndex();
            if (currentOder > 1) {
                Optional<TreatmentStep> prevStepOpt = treatmentStepRepository.findByRecord_IdAndStageOrderIndex(treatmentStep.getRecord().getId(), currentOder - 1);

                if (prevStepOpt.isPresent()) {
                    TreatmentStepStatus prevStepStatus = prevStepOpt.get().getStatus();
                    if (prevStepStatus != TreatmentStepStatus.COMPLETED && prevStepStatus != TreatmentStepStatus.CANCELLED) {
                        throw new AppException(ErrorCode.TREATMENT_CAN_NOT_DONE);
                    }
                }
            }
        }
        treatmentStepMapper.updateTreatmentStep(treatmentStep, request);
        return treatmentStepMapper.toTreatmentStepResponse(treatmentStepRepository.save(treatmentStep));
    }
}
