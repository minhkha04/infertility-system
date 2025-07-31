package com.emmkay.infertility_system.modules.treatment.service;

import com.emmkay.infertility_system.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system.modules.email.enums.EmailType;
import com.emmkay.infertility_system.modules.email.service.EmailService;
import com.emmkay.infertility_system.modules.payment.service.PaymentTransactionService;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.dto.request.RegisterServiceRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordResult;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.mapper.TreatmentRecordMapper;
import com.emmkay.infertility_system.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentRecordBasicProjection;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentRecordDashboardProjection;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
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

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentRecordService {

    TreatmentRecordRepository treatmentRecordRepository;
    UserRepository userRepository;
    DoctorRepository doctorRepository;
    TreatmentRecordMapper treatmentRecordMapper;
    TreatmentStepService treatmentStepService;
    AppointmentService appointmentService;
    DoctorService doctorService;
    PaymentTransactionService paymentTransactionService;
    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentStageRepository treatmentStageRepository;
    EmailService emailService;

    private void sendMail(String subject, EmailType emailType, String toEmail, Map<String, String> params) {
        EmailRequest emailRequest = EmailRequest.builder()
                .subject(subject)
                .emailType(emailType)
                .toEmail(toEmail)
                .params(params)
                .build();
        emailService.sendMail(emailRequest);
    }

    private void canChange(TreatmentRecord treatmentRecord) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || currentUserId == null) {
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

        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        RoleName roleName = RoleName.formString(scope);
        return switch (roleName) {
            case CUSTOMER -> treatmentRecordRepository.searchTreatmentRecords(customerId, null, status, pageable);
            case DOCTOR, MANAGER -> treatmentRecordRepository.searchTreatmentRecords(customerId, doctorId, status, pageable);
            default -> throw new AppException(ErrorCode.UNAUTHORIZED);
        };
    }

    public Page<TreatmentRecordDashboardProjection> getTreatmentRecordDashboard(
            String customerId, String doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        RoleName roleName = RoleName.formString(scope);
        return switch (roleName) {
            case CUSTOMER -> treatmentRecordRepository.getTreatmentRecordDashboard(currentUserId, null, pageable);
            case DOCTOR -> treatmentRecordRepository.getTreatmentRecordDashboard(null, currentUserId, pageable);
            case MANAGER -> treatmentRecordRepository.getTreatmentRecordDashboard(customerId, doctorId, pageable);
            default -> throw new AppException(ErrorCode.UNAUTHORIZED);
        };
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('DOCTOR')")
    @Transactional
    public TreatmentRecordResponse updateStatusTreatmentRecord(Long recordId, TreatmentRecordStatus status, TreatmentRecordResult result) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        canChange(treatmentRecord);
        if (treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.CAN_UPDATE_TREATMENT_RECORD);
        }
        treatmentRecord.setStatus(status);
        if (treatmentRecord.getStatus() == TreatmentRecordStatus.COMPLETED) {
//        check the record is available for status change to complete
//            if (!paymentTransactionService.isPaid(recordId)) {
//            throw new AppException(ErrorCode.TREATMENT_NOT_PAID);
//        }
            Set<TreatmentStep> treatmentSteps = treatmentRecord.getTreatmentSteps();
            treatmentSteps.forEach(treatmentStep -> {
                if (treatmentStep.getStatus() == TreatmentStepStatus.CONFIRMED) {
                    throw new AppException(ErrorCode.TREATMENT_STEP_NOT_COMPLETED);
                }
            });
            treatmentRecord.setEndDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            Map<String, String> params = Map.of(
                    "customerName", treatmentRecord.getCustomer().getFullName(),
                    "serviceName", treatmentRecord.getService().getName(),
                    "doctorName", treatmentRecord.getDoctor().getUsers().getFullName(),
                    "completedDate", treatmentRecord.getEndDate().toString()
            );
            sendMail("Thông báo hoàn thành điều trị", EmailType.RECORD_SUCCESS, treatmentRecord.getCustomer().getEmail(), params);
            treatmentRecord.setResult(result);
        }
        return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(treatmentRecord));
    }

    public TreatmentRecordResponse getTreatmentRecordById(Long treatmentRecordId) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(treatmentRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentRecordResponse treatmentRecordResponse = treatmentRecordMapper
                .toTreatmentRecordResponse(treatmentRecord);
        treatmentRecordResponse.setTreatmentSteps(treatmentStepService.getStepsByRecordId(treatmentRecord.getId()));
        treatmentRecordResponse.setPaid(paymentTransactionService.isPaid(treatmentRecordId));
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


        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        TreatmentService treatmentService = treatmentServiceRepository.findById(request.getTreatmentServiceId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));

        if (request.getStartDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        Doctor doctor;
        User customer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getDoctorId() != null) {
            if (treatmentRecordRepository.existsByCustomerIdAndDoctorIdAndServiceIdAndStatusIn(currentUserId, request.getDoctorId(), request.getTreatmentServiceId(), List.of(TreatmentRecordStatus.INPROGRESS, TreatmentRecordStatus.CONFIRMED))) {
                throw new AppException(ErrorCode.TREATMENT_ALREADY_IN_PROGRESS);
            }
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
            if (!doctorService.isDoctorAvailable(doctor.getId(), request.getStartDate(), request.getShift())) {
                throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
            }
        } else {
            doctor = doctorService.findBestDoctor(request.getStartDate(), request.getShift(), currentUserId, request.getTreatmentServiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.USERNAME_EXISTED));
        }
        TreatmentRecord treatmentRecord = TreatmentRecord.builder()
                .customer(customer)
                .doctor(doctor)
                .service(treatmentService)
                .startDate(request.getStartDate())
                .status(TreatmentRecordStatus.CONFIRMED)
                .createdDate(LocalDate.now())
                .cd1Date(request.getCd1Date())
                .result(TreatmentRecordResult.UNDETERMINED)
                .build();
        TreatmentRecord saveTreatmentRecord = treatmentRecordRepository.save(treatmentRecord);
        TreatmentStage treatmentStage = treatmentStageRepository.findByOrderIndexAndServiceId(0, treatmentService.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STAGE_NOT_EXISTED));
        TreatmentStep treatmentStep = treatmentStepService.createFirstStepInit(TreatmentStepCreateRequest.builder()
                .treatmentRecordId(saveTreatmentRecord.getId())
                .stageId(treatmentStage.getId())
                .startDate(request.getStartDate())
                .status(TreatmentStepStatus.CONFIRMED)
                .build());
        appointmentService.createInitialAppointment(customer, doctor, request.getStartDate(), request.getShift(), treatmentStep, true, null);
        Map<String, String> params = Map.of(
                "serviceName", treatmentService.getName(),
                "doctorName", doctor.getUsers().getFullName(),
                "customerName", customer.getFullName(),
                "price", NumberFormat.getNumberInstance(new Locale("vi", "VN")).format(treatmentService.getPrice())
        );
        sendMail("Thông báo đăng ký dịch vụ", EmailType.REGISTER_SERVICE, customer.getEmail(), params);
    }

    public void cancelTreatmentRecord(Long recordId, String notes) {
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

        treatmentRecord.setNotes(notes);
        treatmentRecord.setStatus(TreatmentRecordStatus.CANCELLED);
        treatmentStepService.cancelStepsByRecordId(recordId);
        treatmentRecordRepository.save(treatmentRecord);
        Map<String, String> params = Map.of(
                "customerName", treatmentRecord.getCustomer().getFullName(),
                "serviceName", treatmentRecord.getService().getName(),
                "cancellationTime", LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).toString()
        );
        sendMail("Hủy dịch vụ", EmailType.RECORD_CANCEL, treatmentRecord.getCustomer().getEmail(), params);
    }
}
