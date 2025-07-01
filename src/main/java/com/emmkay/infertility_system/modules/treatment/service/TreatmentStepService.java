package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentStepMapper;
import com.emmkay.infertility_system.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStepRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepService {

    TreatmentStepRepository treatmentStepRepository;
    TreatmentStepMapper treatmentStepMapper;
    TreatmentStageRepository treatmentStageRepository;
    AppointmentRepository appointmentRepository;
    ReminderRepository reminderRepository;
    TreatmentRecordRepository treatmentRecordRepository;
    AppointmentService appointmentService;

    @Transactional
    public void cancelStepsByRecordId(Long recordId) {
        List<TreatmentStep> treatmentStepList = treatmentStepRepository.getAllByRecordId(recordId);
        treatmentStepList.forEach(x -> {
            log.info("Cancel treatment step: {}", x.getId());
            x.setStatus(TreatmentStepStatus.CANCELLED);
            Appointment appointment = appointmentRepository.getAppointmentsByTreatmentStep(x);
            reminderRepository.deleteByAppointment(appointment);
            appointmentRepository.deleteByTreatmentStep(x);
        });
        treatmentStepRepository.saveAll(treatmentStepList);
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
        if (request.getStatus() == TreatmentStepStatus.COMPLETED) {
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

    public TreatmentStep createFirstStepInit(TreatmentStepCreateRequest request) {
        TreatmentStep treatmentStep = treatmentStepMapper.toTreatmentStep(request);
        TreatmentStage stage = treatmentStageRepository.findById(request.getStageId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_FOUND));
        TreatmentRecord record = treatmentRecordRepository.findById(request.getTreatmentRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        treatmentStep.setRecord(record);
        treatmentStep.setStage(stage);
        treatmentStep.setStepType(stage.getName());
        return treatmentStepRepository.save(treatmentStep);
    }

    public TreatmentStepResponse createTreatmentStep(TreatmentStepCreateRequest request) {
        TreatmentStage stage = treatmentStageRepository.findById(request.getStageId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_FOUND));
        TreatmentRecord record = treatmentRecordRepository.findById(request.getTreatmentRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentStep treatmentStep = treatmentStepMapper.toTreatmentStep(request);
        treatmentStep.setRecord(record);
        treatmentStep.setStage(stage);
        treatmentStep.setStepType(stage.getName());
        TreatmentStep finalTreatmentStep = treatmentStepRepository.save(treatmentStep);
        if (request.isAuto()) {
            appointmentService.createInitialAppointment(record.getCustomer(), record.getDoctor(), request.getScheduledDate(), request.getShift(), finalTreatmentStep, false, request.getPurpose());
        }
        return treatmentStepMapper.toTreatmentStepResponse(finalTreatmentStep);
    }
}
