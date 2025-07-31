package com.emmkay.infertility_system.modules.appointment.service;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system.modules.appointment.dto.request.*;
import com.emmkay.infertility_system.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system.modules.email.dto.request.EmailRequest;
import com.emmkay.infertility_system.modules.email.enums.EmailType;
import com.emmkay.infertility_system.modules.email.service.EmailService;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.shared.enums.Shift;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.appointment.mapper.AppointmentMapper;
import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentStepRepository;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
import com.emmkay.infertility_system.modules.reminder.service.ReminderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentService {

    AppointmentRepository appointmentRepository;
    AppointmentMapper appointmentMapper;
    TreatmentStepRepository treatmentStepRepository;
    DoctorRepository doctorRepository;
    UserRepository userRepository;
    ReminderService reminderService;
    ReminderRepository reminderRepository;
    EmailService emailService;
    AppointmentValidator appointmentValidator;
    DoctorService doctorService;

    private void sendMail(String subject, EmailType emailType, String toEmail, Map<String, String> params) {
        EmailRequest emailRequest = EmailRequest.builder()
                .subject(subject)
                .emailType(emailType)
                .toEmail(toEmail)
                .params(params)
                .build();
        emailService.sendMail(emailRequest);
    }

    private String generateShift(Shift shift) {
        return switch (shift) {
            case MORNING -> "Sáng";
            case AFTERNOON -> "Chiều";
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };
    }

    private AppointmentResponse confirmChangeAppointment(Appointment appointment, AppointmentStatusUpdateRequest request) {
        if (appointment.getStatus() != AppointmentStatus.PENDING_CHANGE) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        String subject;
        EmailType emailType;
        Map<String, String> params = new HashMap<>(Map.of(
                "customerName", appointment.getCustomer().getFullName(),
                "treatmentStepName", appointment.getTreatmentStep().getStepType()
        ));
        switch (request.getStatus()) {
            case PLANED:
                boolean isAvailable = doctorService.isDoctorAvailable(appointment.getDoctor().getId(), appointment.getRequestedDate(), appointment.getRequestedShift());
                if (!isAvailable) {
                    throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
                }
                subject = "Xác nhận thay đổi lịch hẹn";
                emailType = EmailType.APPOINTMENT_CHANGE_SUCCESS;
                params.putAll(Map.of(
                                "confirmedDate", appointment.getRequestedDate().toString(),
                                "confirmedShift", generateShift(appointment.getRequestedShift()),
                                "doctorName", appointment.getDoctor().getUsers().getFullName(),
                                "notes", request.getNote()
                        )
                );
                reminderRepository.deleteByAppointment_Id(appointment.getId());
                appointment.setAppointmentDate(appointment.getRequestedDate());
                appointment.setShift(appointment.getRequestedShift());
                reminderService.createReminderForAppointment(appointment);
                break;
            case REJECTED:
                subject = "Xác nhận thay đổi lịch hẹn";
                emailType = EmailType.APPOINTMENT_CHANGE_FAIL;
                params.putAll(Map.of(
                                "requestDate", appointment.getRequestedDate().toString(),
                                "requestShift", generateShift(appointment.getRequestedShift()),
                                "notes", request.getNote()
                        )
                );
                appointment.setRejectedDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                break;
            default:
                throw new AppException(ErrorCode.STATUS_IS_INVALID);
        }
        sendMail(subject, emailType, appointment.getCustomer().getEmail(), params);
        appointment.setRequestedDate(null);
        appointment.setRequestedShift(null);
        appointment.setStatus(request.getStatus());
        appointment.setReasonChange(null);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse cancelAppointment(Appointment appointment, AppointmentStatusUpdateRequest request) {
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes(request.getNote());
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse completedAppointment(Appointment appointment, AppointmentStatusUpdateRequest request) {
        appointmentValidator.validateCanChangeAppointment(appointment);
//        check today is appointment date
//        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
//        if (!appointment.getAppointmentDate().equals(today)) {
//            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
//        }
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        appointment.setStatus(request.getStatus());
        appointment.setNotes(request.getNote());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse confirmAppointmentByCustomer(Appointment appointment, AppointmentStatusUpdateRequest request) {
        appointment.setStatus(request.getStatus());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
//    giây(0 - 59) phút(0 - 59)  giờ(0 - 23) ngày (1 - 31) tháng(1 - 12) thứ (0 - 7) (0 hoặc 7 = Chủ nhật)
    public void changeAppointmentInit() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDate targetDate = today.minusDays(1);
        List<Appointment> appointmentList = appointmentRepository.getAllByRejectedDate(targetDate);
        appointmentList.forEach(appointment -> {
            User doctor = userRepository.findById(appointment.getDoctor().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
            appointment.setRejectedDate(null);
            appointment.setRequestedDate(null);
            appointment.setRequestedShift(null);
            appointment.setStatus(AppointmentStatus.PLANED);
            sendMail("Yêu cầu đổi lịch hẹn đã hết hạn", EmailType.APPOINTMENT_AUTO_REVERT, appointment.getCustomer().getEmail(), Map.of(
                    "customerName", appointment.getCustomer().getFullName(),
                    "treatmentStepName", appointment.getTreatmentStep().getStepType(),
                    "originalDate", appointment.getAppointmentDate().toString(),
                    "originalShift", generateShift(appointment.getShift()),
                    "doctorName", doctor.getFullName()
            ));
        });
        appointmentRepository.saveAll(appointmentList);
    }

    public Page<AppointmentBasicProjection> searchAppointments(String customerId, String doctorId, LocalDate date, AppointmentStatus status, int page, int size) {
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.valueOf(scope.toUpperCase());
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").ascending());
        return switch (roleName) {
            case CUSTOMER -> appointmentRepository.searchAppointments(currentUserId, null, date, status, pageable);
            case DOCTOR -> appointmentRepository.searchAppointments(null, currentUserId, date, status, pageable);
            case MANAGER -> appointmentRepository.searchAppointments(customerId, doctorId, date, status, pageable);
            default -> throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        };
    }

    public AppointmentResponse getAppointmentDetail(Long appointmentId) {
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.valueOf(scope.toUpperCase());
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        switch (roleName) {
            case CUSTOMER -> {
                if (!appointment.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            case DOCTOR -> {
                if (!appointment.getDoctor().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            case MANAGER -> {
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            default -> throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }
    }

    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.getAppointmentsById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        appointmentValidator.validateCanChangeAppointment(appointment);
        switch (request.getStatus()) {
            case CANCELLED -> {
                return cancelAppointment(appointment, request);
            }
            case PLANED, REJECTED -> {
                return confirmChangeAppointment(appointment, request);
            }
            case COMPLETED -> {
                return completedAppointment(appointment, request);
            }
            case CONFIRMED -> {
                return confirmAppointmentByCustomer(appointment, request);
            }
            default -> throw new AppException(ErrorCode.STATUS_IS_INVALID);
        }
    }

    @Transactional
    public void createInitialAppointment(User customer, Doctor doctor, LocalDate date, Shift shift, TreatmentStep treatmentStep, boolean isFirstStep, String purpose) {
        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .customer(customer)
                .doctor(doctor)
                .appointmentDate(date)
                .shift(shift)
                .treatmentStep(treatmentStep)
                .status(AppointmentStatus.PLANED)
                .createdAt(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .purpose(isFirstStep ? treatmentStep.getStepType() : purpose)
                .build());
        reminderService.createReminderForAppointment(appointment);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest req) {
        boolean isAvailable = doctorService.isDoctorAvailable(req.getDoctorId(), req.getAppointmentDate(), req.getShift());
        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        TreatmentStep step = treatmentStepRepository.findById(req.getTreatmentStepId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

//        check appointment date is not in pass and not today
        if (req.getAppointmentDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        if (req.getAppointmentDate().isBefore(step.getStartDate())) {
            throw new AppException(ErrorCode.APPOINTMENT_DATE_BEFORE_STEP_START_DATE);
        }

        if (step.getStatus() == TreatmentStepStatus.COMPLETED
                || step.getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.STEP_IS_COMPLETE_OR_CANCEL);
        }
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Appointment appointment = appointmentMapper.toAppointment(req);
        appointment.setDoctor(doctor);
        appointment.setTreatmentStep(step);
        appointment.setStatus(AppointmentStatus.PLANED);
        appointment.setCreatedAt(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        appointment.setCustomer(customer);
        appointment = appointmentRepository.save(appointment);
        reminderService.createReminderForAppointment(appointment);
        return appointmentMapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse changeAppointmentForCustomer(Long appointmentId, ChangeAppointmentByCustomerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        if (appointment.getAppointmentDate().equals(request.getRequestedDate()) && appointment.getShift() == request.getRequestedShift()) {
            throw new AppException(ErrorCode.APPOINTMENT_DATE_NOT_CHANGED);
        }
        appointmentValidator.validateAppointmentAvailableForChange(appointment, request.getRequestedDate(), request.getRequestedShift());
        appointmentValidator.validateCanChangeAppointment(appointment);
        Map<String, String> params = Map.of(
                "customerName", appointment.getCustomer().getFullName(),
                "requestDate", request.getRequestedDate().toString(),
                "requestShift", generateShift(request.getRequestedShift()),
                "treatmentStepName", appointment.getTreatmentStep().getStepType(),
                "reason", request.getNotes()
        );

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.STEP_IS_COMPLETE_OR_CANCEL);
        }

        if (request.getRequestedDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }
        appointment.setRequestedDate(request.getRequestedDate());
        appointment.setRequestedShift(request.getRequestedShift());
        appointment.setReasonChange(request.getNotes());
        appointment.setStatus(AppointmentStatus.PENDING_CHANGE);
        sendMail("Xác nhận yêu cầu đổi lịch hẹn", EmailType.APPOINTMENT_CHANGE_CUSTOMER, appointment.getCustomer().getEmail(), params);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse changeAppointmentForManagerOrDoctor(Long appointmentId, ChangeAppointmentByDoctorOrManagerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        appointmentValidator.validateCanChangeAppointment(appointment);
        appointmentValidator.validateAppointmentAvailableForChange(appointment, request.getAppointmentDate(), request.getShift());

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.STEP_IS_COMPLETE_OR_CANCEL);
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        Map<String, String> params = Map.of(
                "customerName", appointment.getCustomer().getFullName(),
                "oldDate", appointment.getAppointmentDate().toString(),
                "oldShift", generateShift(appointment.getShift()),
                "newDate", request.getAppointmentDate().toString(),
                "newShift", generateShift(request.getShift()),
                "doctorName", appointment.getDoctor().getUsers().getFullName(),
                "treatmentStepName", appointment.getTreatmentStep().getStepType()
        );

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setShift(request.getShift());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        reminderService.createReminderForAppointment(appointment);

        sendMail("Thông báo thay đổi lịch hẹn", EmailType.APPOINTMENT_CHANGE_DOCTOR_MANAGER, appointment.getCustomer().getEmail(), params);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse updateAppointment(AppointmentUpdateRequest request, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        appointmentValidator.validateCanChangeAppointment(appointment);

        appointmentMapper.updateAppointment(appointment, request);

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        if (!appointment.getDoctor().getId().equals(doctor.getId()) && !doctorService.isDoctorAvailable(doctor.getId(), appointment.getAppointmentDate(), appointment.getShift())) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        appointment.setDoctor(doctor);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getAppointmentsByStepId(Long stepId) {
        return appointmentRepository.getAppointmentsByTreatmentStepId(stepId)
                .stream()
                .map(appointmentMapper::toAppointmentResponse)
                .toList();
    }
}
