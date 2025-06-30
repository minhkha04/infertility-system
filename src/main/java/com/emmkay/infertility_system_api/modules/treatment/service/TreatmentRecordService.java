package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system_api.modules.shared.enums.RoleName;
import com.emmkay.infertility_system_api.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.RegisterServiceRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentRecordMapper;
import com.emmkay.infertility_system_api.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system_api.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.treatment.projection.TreatmentRecordBasicProjection;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentRecordService {

    TreatmentRecordRepository treatmentRecordRepository;
    TreatmentStageRepository treatmentStageRepository;
    UserRepository userRepository;
    DoctorRepository doctorRepository;
    TreatmentRecordMapper treatmentRecordMapper;
    TreatmentStepService treatmentStepService;
    AppointmentService appointmentService;
    DoctorService doctorService;
    PaymentTransactionService paymentTransactionService;
    TreatmentServiceRepository treatmentServiceRepository;

    private void canChange(TreatmentRecord treatmentRecord) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        RoleName roleName = RoleName.formString(scope);
        switch (roleName) {
            case MANAGER:
                break;
            case DOCTOR:
                if (!treatmentRecord.getDoctor().getId().equals(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case CUSTOMER:
                if (!treatmentRecord.getCustomer().getId().equals(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public Page<TreatmentRecordBasicProjection> searchTreatmentRecords(
            String customerId, String doctorId, TreatmentRecordStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();

        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        RoleName roleName = RoleName.formString(scope);
        return switch (roleName) {
            case CUSTOMER -> treatmentRecordRepository.searchTreatmentRecords(customerId, null, status, pageable);
            case DOCTOR -> treatmentRecordRepository.searchTreatmentRecords(null, doctorId, status, pageable);
            case MANAGER -> treatmentRecordRepository.searchTreatmentRecords(customerId, doctorId, status, pageable);
            default -> throw new AppException(ErrorCode.UNAUTHORIZED);
        };
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('DOCTOR')")
    public TreatmentRecordResponse updateStatusTreatmentRecord(Long recordId, TreatmentRecordStatus status) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        canChange(treatmentRecord);
//        check the record is available for status change to completed
//        if (!paymentTransactionService.isPaid(recordId) && status == TreatmentRecordStatus.COMPLETED) {
//            throw new AppException(ErrorCode.TREATMENT_NOT_PAID);
//        }
        if (treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        treatmentRecord.setStatus(status);
        return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(treatmentRecord));
    }

    public TreatmentRecordResponse getTreatmentRecordById(Long treatmentRecordId) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(treatmentRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentRecordResponse treatmentRecordResponse = treatmentRecordMapper
                .toTreatmentRecordResponse(treatmentRecord);
        treatmentRecordResponse.setTreatmentSteps(treatmentStepService.getStepsByRecordId(treatmentRecord.getId()));
        treatmentRecordResponse.setIsPaid(paymentTransactionService.isPaid(treatmentRecordId));
        RoleName roleName = RoleName.formString(scope);
        switch (roleName) {
            case CUSTOMER:
                if (!treatmentRecord.getCustomer().getId().equals(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case DOCTOR:
                if (!treatmentRecord.getDoctor().getId().equals(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case MANAGER:
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return treatmentRecordResponse;
    }

    @Transactional
    @PreAuthorize("hasRole('CUSTOMER')")
    public void creatTreatmentRecord(RegisterServiceRequest request) {
//      check has Record before
//        if (treatmentRecordRepository.existsByCustomerIdAndStatusIn(
//                customerId, List.of("PENDING", "INPROGRESS")
//        )) {
//            throw new AppException(ErrorCode.TREATMENT_ALREADY_IN_PROGRESS);
//        }
        TreatmentService treatmentService = treatmentServiceRepository.findById(request.getTreatmentServiceId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));

        if (request.getStartDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Doctor doctor;
        User customer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!request.getDoctorId().isEmpty()) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        } else {
            doctor = doctorService.findBestDoctor(request.getStartDate(), request.getShift())
                    .orElseThrow(() -> new AppException(ErrorCode.USERNAME_EXISTED));
        }
        if (!appointmentService.isDoctorAvailable(doctor.getId(), request.getStartDate(), request.getShift())) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        TreatmentRecord treatmentRecord = TreatmentRecord.builder()
                .customer(customer)
                .doctor(doctor)
                .service(treatmentService)
                .startDate(request.getStartDate())
                .status(TreatmentRecordStatus.INPROGRESS)
                .createdDate(LocalDate.now())
                .cd1Date(request.getCd1Date())
                .build();
        TreatmentRecord saveTreatmentRecord = treatmentRecordRepository.save(treatmentRecord);

        List<TreatmentStage> stages = treatmentStageRepository.findByTypeIdOrderByOrderIndexAsc(treatmentService.getType().getId());
        List<TreatmentStep> steps = treatmentStepService.buildSteps(saveTreatmentRecord, stages, request.getStartDate());

        TreatmentStep firstStep = steps.stream()
                .filter(step -> step.getStage().getOrderIndex() == 1)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));

        appointmentService.createInitialAppointment(customer, doctor, request.getStartDate(), request.getShift(), firstStep);

        TreatmentRecordResponse treatmentRecordResponse = treatmentRecordMapper.toTreatmentRecordResponse(saveTreatmentRecord);
        treatmentRecordResponse.setTreatmentSteps(treatmentStepService.saveAll(steps));
    }

    @Transactional
    public void cancelTreatmentRecord(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        canChange(treatmentRecord);

        if (treatmentRecord.getStatus() == TreatmentRecordStatus.COMPLETED
                || treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_TREATMENT);
        }

        if (paymentTransactionService.isPaid(recordId)) {
            throw new AppException(ErrorCode.TREATMENT_RECORD_IS_PAID);
        }

        treatmentRecord.setStatus(TreatmentRecordStatus.CANCELLED);
        treatmentStepService.cancelStepsByRecordId(recordId);
        treatmentRecordRepository.save(treatmentRecord);
    }

    public TreatmentRecordResponse updateCd1TreatmentRecord(Long recordId, LocalDate cd1) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        canChange(treatmentRecord);
        if (treatmentRecord.getStatus() == TreatmentRecordStatus.COMPLETED
                || treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_TREATMENT);
        }
        treatmentRecord.setCd1Date(cd1);
        return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(treatmentRecord));
    }

}
