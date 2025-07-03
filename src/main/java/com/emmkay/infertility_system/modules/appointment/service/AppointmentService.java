package com.emmkay.infertility_system.modules.appointment.service;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system.modules.appointment.dto.request.*;
import com.emmkay.infertility_system.modules.appointment.dto.response.AppointmentResponse;
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
import com.emmkay.infertility_system.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system.modules.schedule.repository.WorkScheduleRepository;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentStepStatus;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
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
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentService {

    AppointmentRepository appointmentRepository;
    WorkScheduleRepository workScheduleRepository;
    AppointmentMapper appointmentMapper;
    TreatmentStepRepository treatmentStepRepository;
    DoctorRepository doctorRepository;
    UserRepository userRepository;
    ReminderService reminderService;
    ReminderRepository reminderRepository;
    TreatmentRecordRepository treatmentRecordRepository;
    EmailService emailService;

    private void validateCanChangeAppointment(Appointment appointment) {
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.valueOf(scope.toUpperCase());
        switch (roleName) {
            case CUSTOMER:
                if (!appointment.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case DOCTOR:
                if (!appointment.getDoctor().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case MANAGER:
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateAppointmentAvailableForChange(Appointment appointment, LocalDate dateChange, Shift shiftChange) {
        // Chỉ cho đổi trong 14 ngày tới
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (dateChange.isBefore(today) || dateChange.isAfter(today.plusDays(14))) {
            throw new AppException(ErrorCode.DATE_OUT_OF_RANGE);
        }

        // Kiểm tra ca đó có nằm trong lịch làm việc rảnh không
        String doctorId = appointment.getDoctor().getId();
        boolean isAvailable = isDoctorAvailable(doctorId, dateChange, shiftChange);

        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
    }

    private void checkDoctorHasWorkSchedule(String doctorId, LocalDate date, List<Shift> shift) {
        workScheduleRepository.findByDoctorIdAndWorkDateAndShiftIn(doctorId, date, shift)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_DONT_WORK_ON_THIS_DATE));
    }

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
            case MORNING -> "sáng";
            case AFTERNOON -> "chiều";
            default -> throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        };
    }

    private AppointmentResponse confirmChangeAppointment(Appointment appointment, AppointmentStatusUpdateRequest request) {

        validateCanChangeAppointment(appointment);
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
            case CONFIRMED:
                boolean isAvailable = isDoctorAvailable(appointment.getDoctor().getId(), appointment.getRequestedDate(), appointment.getRequestedShift());
                if (!isAvailable) {
                    throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
                }
                subject = "Xác nhận thay đổi lịch hẹn";
                emailType = EmailType.APPOINTMENT_CHANGE_SUCCESS;
                params.putAll(Map.of(
                                "confirmedDate", appointment.getRequestedDate().toString(),
                                "confirmedShift", appointment.getRequestedShift().toString(),
                                "doctorName", appointment.getDoctor().getUsers().getFullName()
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
                String reason = "Không phù hợp với tuyến trình";

                params.putAll(Map.of(
                                "rejectionReason", reason,
                                "requestDate", appointment.getRequestedDate().toString(),
                                "requestShift", appointment.getRequestedShift().toString()
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
        appointment.setNotes(request.getNote());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse cancelAppointment(Appointment appointment, AppointmentStatusUpdateRequest request) {
        validateCanChangeAppointment(appointment);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes(request.getNote());
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse changeAppointmentWithStatusCompleted(Appointment appointment, AppointmentStatusUpdateRequest request) {
        validateCanChangeAppointment(appointment);
//        check today is appointment date
//        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
//        if (!appointment.getAppointmentDate().equals(today)) {
//            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
//        }
        appointment.setStatus(request.getStatus());
        appointment.setNotes(request.getNote());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
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
            appointment.setStatus(AppointmentStatus.CONFIRMED);
            sendMail("Yêu cầu đổi lịch hẹn đã hết hạn", EmailType.APPOINTMENT_AUTO_REVERT, appointment.getCustomer().getEmail(), Map.of(
                    "customerName", appointment.getCustomer().getFullName(),
                    "treatmentStepName", appointment.getTreatmentStep().getStepType(),
                    "originalDate", appointment.getAppointmentDate().toString(),
                    "originalShift", appointment.getShift().toString(),
                    "doctorName", doctor.getFullName()
            ));
        });
        appointmentRepository.saveAll(appointmentList);
    }

    public Page<AppointmentBasicProjection> searchAppointments(Long stepId, String customerId, String doctorId, LocalDate date, AppointmentStatus status, int page, int size) {
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.valueOf(scope.toUpperCase());
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").ascending());
        return switch (roleName) {
            case CUSTOMER ->
                    appointmentRepository.searchAppointments(stepId, currentUserId, null, date, status, pageable);
            case DOCTOR ->
                    appointmentRepository.searchAppointments(stepId, null, currentUserId, date, status, pageable);
            case MANAGER ->
                    appointmentRepository.searchAppointments(stepId, customerId, doctorId, date, status, pageable);
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
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.getAppointmentsById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_IS_COMPLETED);
        }
        switch (request.getStatus()) {
            case CANCELLED -> {
                return cancelAppointment(appointment, request);
            }
            case CONFIRMED, REJECTED -> {
                return confirmChangeAppointment(appointment, request);
            }
            case COMPLETED -> {
                return changeAppointmentWithStatusCompleted(appointment, request);
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
                .status(AppointmentStatus.CONFIRMED)
                .createdAt(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .purpose(isFirstStep ? treatmentStep.getStepType() : purpose)
                .build());
        reminderService.createReminderForAppointment(appointment);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest req) {
        boolean isAvailable = isDoctorAvailable(req.getDoctorId(), req.getAppointmentDate(), req.getShift());
        checkDoctorHasWorkSchedule(req.getDoctorId(), req.getAppointmentDate(), List.of(req.getShift(), Shift.FULL_DAY));
        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        TreatmentStep step = treatmentStepRepository.findById(req.getTreatmentStepId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        if (!req.getAppointmentDate().isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(step.getRecord().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus() == TreatmentRecordStatus.COMPLETED
                || treatmentRecord.getStatus() == TreatmentRecordStatus.CANCELLED) {
            throw new AppException(ErrorCode.TREATMENT_RECORD_IS_COMPLETED_OR_CANCELLED);
        }

        if (step.getStatus() == TreatmentStepStatus.COMPLETED
                || step.getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Appointment appointment = appointmentMapper.toAppointment(req);
        appointment.setDoctor(doctor);
        appointment.setTreatmentStep(step);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setCreatedAt(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")));
        appointment.setCustomer(customer);
        appointment = appointmentRepository.save(appointment);
        reminderService.createReminderForAppointment(appointment);
        return appointmentMapper.toAppointmentResponse(appointment);
    }

    public boolean isDoctorAvailable(String doctorId, LocalDate date, Shift shift) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElse(null);
        if (doctor.getUsers().getIsRemoved() || !doctor.getIsPublic()) {
            return false;
        }
        Optional<WorkSchedule> workScheduleOpt = workScheduleRepository
                .findByDoctorIdAndWorkDate(doctorId, date);


        if (workScheduleOpt.isEmpty()) return false;
        Shift actualShift = workScheduleOpt.get().getShift();

        // Nếu bác sĩ không làm ca đó (không phải ca tương ứng và cũng không phải full_day)
        if (actualShift != shift && actualShift != Shift.FULL_DAY) {
            return false;
        }

        // Đếm số lịch trong ca cụ thể (morning hoặc afternoon)
        int shiftAppointmentCount = appointmentRepository
                .countActiveByDoctorIdAndDateAndShift(doctorId, date, shift);

        return shiftAppointmentCount < 10;
    }

    @Transactional
    public AppointmentResponse changeAppointmentForCustomer(Long appointmentId, ChangeAppointmentByCustomerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        checkDoctorHasWorkSchedule(appointment.getDoctor().getId(), request.getRequestedDate(), List.of(request.getRequestedShift(), Shift.FULL_DAY));
        validateAppointmentAvailableForChange(appointment, request.getRequestedDate(), request.getRequestedShift());
        validateCanChangeAppointment(appointment);
        Map<String, String> params = Map.of(
                "customerName", appointment.getCustomer().getFullName(),
                "requestDate", request.getRequestedDate().toString(),
                "requestShift", generateShift(request.getRequestedShift()),
                "treatmentStepName", appointment.getTreatmentStep().getStepType()
        );

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }

        if (request.getRequestedDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        appointmentMapper.requestChangeAppointment(appointment, request);
        appointment.setStatus(AppointmentStatus.PENDING_CHANGE);
        sendMail("Xác nhận yêu cầu đổi lịch hẹn", EmailType.APPOINTMENT_CHANGE_CUSTOMER, appointment.getCustomer().getEmail(), params);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse changeAppointmentForManagerOrDoctor(Long appointmentId, ChangeAppointmentByDoctorOrManagerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        checkDoctorHasWorkSchedule(appointment.getDoctor().getId(), request.getAppointmentDate(), List.of(request.getShift(), Shift.FULL_DAY));
        validateCanChangeAppointment(appointment);
        validateAppointmentAvailableForChange(appointment, request.getAppointmentDate(), request.getShift());

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
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
        validateCanChangeAppointment(appointment);

        appointmentMapper.updateAppointment(appointment, request);

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        if (!appointment.getDoctor().getId().equals(doctor.getId()) && !isDoctorAvailable(doctor.getId(), appointment.getAppointmentDate(), appointment.getShift())) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        appointment.setDoctor(doctor);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }
}
