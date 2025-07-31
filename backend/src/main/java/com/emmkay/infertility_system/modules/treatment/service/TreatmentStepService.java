package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
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

    private void canChange(String doctorId) {
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.formString(scope);
        switch (roleName) {
            case MANAGER:
                break;
            case DOCTOR:
                if (!doctorId.equals(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void completeStep(TreatmentStepUpdateRequest request, TreatmentStep treatmentStep, TreatmentRecord record) {
        if (request.getEndDate() == null) {
            throw new AppException(ErrorCode.END_DATE_REQUIRED);
        }
        List<Appointment> appointmentList = appointmentRepository.getAppointmentsByTreatmentStep(treatmentStep);
        Appointment lastAppointmentInStep = appointmentRepository.findTopByTreatmentStepOrderByAppointmentDateDesc(treatmentStep);
        if (lastAppointmentInStep != null && request.getEndDate().isBefore(lastAppointmentInStep.getAppointmentDate())) {
            throw new AppException(ErrorCode.END_DATE_BEFORE_LAST_APPOINTMENT);
        }
        if (!appointmentList.isEmpty()) {
            List<AppointmentStatus> appointmentStatuses = List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CHANGE, AppointmentStatus.REJECTED, AppointmentStatus.PLANED);
            boolean hasUnprocessedAppointments = appointmentRepository.existsByStatusInAndTreatmentStep(appointmentStatuses, treatmentStep);
            if (hasUnprocessedAppointments) {
                throw new AppException(ErrorCode.TREATMENT_CAN_NOT_DONE);
            }
        }
        if (treatmentStep.getStage().getOrderIndex() != 0) {
            TreatmentStep prevStep = treatmentStepRepository.findClosestPreviousStep(record.getId(), treatmentStep.getStage().getOrderIndex());
            if (prevStep.getStatus() == TreatmentStepStatus.CONFIRMED || prevStep.getStatus() == TreatmentStepStatus.INPROGRESS) {
                throw new AppException(ErrorCode.TREATMENT_STEP_PREV_IN_CONFIRMED);
            }
        }
    }

    private void cancelStep(TreatmentStep treatmentStep) {
        List<Appointment> appointmentList = appointmentRepository.getAppointmentsByTreatmentStep(treatmentStep);
        appointmentList.forEach(reminderRepository::deleteByAppointment);
        appointmentRepository.deleteByTreatmentStep(treatmentStep);
    }

    private void inProgressStep(TreatmentStep treatmentStep, TreatmentRecord record) {
        if (treatmentStep.getStage().getOrderIndex() != 0) {
            TreatmentStep prevStep = treatmentStepRepository.findByRecordAndStageOrderIndex(record, treatmentStep.getStage().getOrderIndex() - 1)
                    .orElseThrow(() -> new AppException(ErrorCode.PREVIOUS_TREATMENT_STEP_NOT_FOUND));
            if (prevStep.getStatus() == TreatmentStepStatus.CONFIRMED || prevStep.getStatus() == TreatmentStepStatus.INPROGRESS) {
                throw new AppException(ErrorCode.TREATMENT_STEP_PREV_IN_CONFIRMED);
            }
        }
    }

    @Transactional
    public void cancelStepsByRecordId(Long recordId) {
        List<TreatmentStep> treatmentStepList = treatmentStepRepository.getAllByRecordId(recordId);
        treatmentStepList.forEach(x -> {
            x.setStatus(TreatmentStepStatus.CANCELLED);
            List<Appointment> appointmentList = appointmentRepository.getAppointmentsByTreatmentStep(x);
            appointmentList.forEach(reminderRepository::deleteByAppointment);
            appointmentRepository.deleteByTreatmentStep(x);
        });
        treatmentStepRepository.saveAll(treatmentStepList);
    }

    public List<TreatmentStepResponse> getStepsByRecordId(Long recordId) {
        return treatmentStepRepository.getAllByRecordId(recordId)
                .stream()
                .map(treatmentStepMapper::toTreatmentStepResponse)
                .toList();
    }

    @Transactional
    public TreatmentStepResponse updateTreatmentStepById(Long id, TreatmentStepUpdateRequest request) {
        TreatmentStep treatmentStep = treatmentStepRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));
        TreatmentRecord record = treatmentStep.getRecord();
        if (treatmentStep.getStatus() == TreatmentStepStatus.CANCELLED || treatmentStep.getStatus() == TreatmentStepStatus.COMPLETED) {
            throw new AppException(ErrorCode.TREATMENT_STEP_COMPLETED_OR_CANCELLED);
        }
        canChange(record.getDoctor().getId());
        switch (request.getStatus()) {
            case COMPLETED:
                completeStep(request, treatmentStep, record);
                break;
            case CANCELLED:
                cancelStep(treatmentStep);
                break;
            case INPROGRESS:
                inProgressStep(treatmentStep, record);
                break;
            case CONFIRMED:
                break;
            default:
                throw new AppException(ErrorCode.STATUS_IS_INVALID);
        }
        TreatmentStage stage = treatmentStageRepository.findById(request.getStageId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_FOUND));
        treatmentStep.setStage(stage);
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
        treatmentStep.setStartDate(request.getStartDate());
        return treatmentStepRepository.save(treatmentStep);
    }

    public TreatmentStepResponse createTreatmentStep(TreatmentStepCreateRequest request) {
        TreatmentStage stage = treatmentStageRepository.findById(request.getStageId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_FOUND));
        if (treatmentStepRepository.existsTreatmentStepByStageIdAndRecordIdAndStatusIn(request.getStageId(), request.getTreatmentRecordId(), List.of(TreatmentStepStatus.CONFIRMED, TreatmentStepStatus.COMPLETED))) {
            throw new AppException(ErrorCode.TREATMENT_STEP_ALREADY_EXISTS);
        }
        TreatmentRecord record = treatmentRecordRepository.findById(request.getTreatmentRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        if (record.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.TREATMENT_RECORD_IS_COMPLETED_OR_CANCELLED);
        }
        canChange(record.getDoctor().getId());
        if (stage.getOrderIndex() != 0) {
            treatmentStepRepository.findByRecordAndStageOrderIndex(record, stage.getOrderIndex() - 1)
                    .orElseThrow(() -> new AppException(ErrorCode.PREVIOUS_TREATMENT_STEP_NOT_FOUND));
        }
        TreatmentStep treatmentStep = treatmentStepMapper.toTreatmentStep(request);
        treatmentStep.setRecord(record);
        treatmentStep.setStage(stage);
        treatmentStep.setStepType(stage.getName());
        TreatmentStep finalTreatmentStep = treatmentStepRepository.save(treatmentStep);
        if (request.isAuto()) {
            appointmentService.createInitialAppointment(record.getCustomer(), record.getDoctor(), request.getStartDate(), request.getShift(), finalTreatmentStep, false, request.getPurpose());
        }
        return treatmentStepMapper.toTreatmentStepResponse(finalTreatmentStep);
    }

    public TreatmentStepResponse getStepsById(long id) {
        TreatmentStep treatmentStep = treatmentStepRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));
        canChange(treatmentStep.getRecord().getDoctor().getId());
        return treatmentStepMapper.toTreatmentStepResponse(treatmentStep);
    }
}
