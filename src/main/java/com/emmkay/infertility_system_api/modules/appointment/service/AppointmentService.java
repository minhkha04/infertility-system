package com.emmkay.infertility_system_api.modules.appointment.service;

import com.emmkay.infertility_system_api.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system_api.modules.appointment.dto.request.*;
import com.emmkay.infertility_system_api.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.appointment.mapper.AppointmentMapper;
import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
import com.emmkay.infertility_system_api.modules.appointment.repository.AppointmentRepository;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system_api.modules.reminder.repository.ReminderRepository;
import com.emmkay.infertility_system_api.modules.schedule.entity.WorkSchedule;
import com.emmkay.infertility_system_api.modules.schedule.repository.WorkScheduleRepository;
import com.emmkay.infertility_system_api.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStepRepository;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import com.emmkay.infertility_system_api.modules.reminder.service.ReminderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

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

    private void validateAppointmentAvailableForChange(Appointment appointment, LocalDate dateChange, String shiftChange) {
        // Chỉ cho đổi trong 14 ngày tới
        LocalDate today = LocalDate.now();
        if (dateChange.isBefore(today) || dateChange.isAfter(today.plusDays(14))) {
            throw new AppException(ErrorCode.DATE_OUT_OF_RANGE);
        }

        // Kiểm tra ca đó có nằm trong lịch làm việc rảnh không
        String doctorId = appointment.getDoctor().getId();
        boolean isAvailable = isDoctorAvailable(doctorId, dateChange, shiftChange);

        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        if ("COMPLETED".equalsIgnoreCase(appointment.getStatus())
                || "CANCELLED".equalsIgnoreCase(appointment.getStatus())) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
    }

    private void validateCanChangeAppointment(Appointment appointment) {
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        switch (scope.toUpperCase()) {
            case "CUSTOMER":
                if (!appointment.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case "DOCTOR":
                if (!appointment.getDoctor().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                break;
            case "MANAGER":
                break;
            default:
                throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public Page<AppointmentBasicProjection> searchAppointments(Long stepId, String customerId, String doctorId, LocalDate date, String status, int page, int size) {
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").ascending());
        return switch (scope.toUpperCase()) {
            case "CUSTOMER" -> appointmentRepository.searchAppointments(stepId, currentUserId, null, date, status, pageable);
            case "DOCTOR" -> appointmentRepository.searchAppointments(stepId,null, currentUserId, date, status, pageable);
            case "MANAGER" -> appointmentRepository.searchAppointments(stepId, customerId, doctorId, date, status, pageable);
            default -> throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        };
    }

    public AppointmentResponse getAppointmentDetail(Long appointmentId) {
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null || scope.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        switch (scope) {
            case "CUSTOMER" -> {
                if (!appointment.getCustomer().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            case "DOCTOR" -> {
                if (!appointment.getDoctor().getId().equalsIgnoreCase(currentUserId)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            case "MANAGER" -> {
                return appointmentMapper.toAppointmentResponse(appointment);
            }
            default -> throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse updateStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        appointment.setStatus(status.toUpperCase());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    //auto generate
    public void createInitialAppointment(User customer,Doctor doctor, LocalDate date, String shift, TreatmentStep treatmentStep) {
        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .customer(customer)
                .doctor(doctor)
                .appointmentDate(date)
                .shift(shift)
                .treatmentStep(treatmentStep)
                .status("CONFIRMED")
                .purpose(treatmentStep.getStage().getName())
                .createdAt(LocalDate.now())
                .build());
        reminderService.createReminderForAppointment(appointment);
    }

    public boolean isDoctorAvailable(String doctorId, LocalDate date, String shift) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElse(null);
        if (doctor.getUsers().getIsRemoved() || !doctor.getIsPublic()) {
            return false;
        }
        Optional<WorkSchedule> workScheduleOpt = workScheduleRepository
                .findByDoctorIdAndWorkDate(doctorId, date);


        if (workScheduleOpt.isEmpty()) return false;
        String actualShift = workScheduleOpt.get().getShift();

        // Nếu bác sĩ không làm ca đó (không phải ca tương ứng và cũng không phải full_day)
        if (!actualShift.equals(shift) && !"FULL_DAY".equals(actualShift)) {
            return false;
        }

        // Đếm số lịch trong ca cụ thể (morning hoặc afternoon)
        int shiftAppointmentCount = appointmentRepository
                .countActiveByDoctorIdAndDateAndShift(doctorId, date, shift);

        return shiftAppointmentCount < 10;
    }

    //create appointment
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest req) {
        boolean isAvailable = isDoctorAvailable(req.getDoctorId(), req.getAppointmentDate(), req.getShift());
        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        TreatmentStep step = treatmentStepRepository.findById(req.getTreatmentStepId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        if (!req.getAppointmentDate().isAfter(LocalDate.now())) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(step.getRecord().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus().equalsIgnoreCase("COMPLETED")
                || treatmentRecord.getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.TREATMENT_RECORD_IS_COMPLETED_OR_CANCELLED);
        }

        if (step.getStatus().equalsIgnoreCase("COMPLETED")
                || step.getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }
        req.setShift(req.getShift().toUpperCase());
        if (!"MORNING".equalsIgnoreCase(req.getShift()) && !"AFTERNOON".equalsIgnoreCase(req.getShift())) {
            throw new AppException(ErrorCode.INVALID_SHIFT_VALUE);
        }

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Appointment appointment = appointmentMapper.toAppointment(req);
        appointment.setDoctor(doctor);
        appointment.setTreatmentStep(step);
        appointment.setStatus("CONFIRMED");
        appointment.setCreatedAt(LocalDate.now());
        appointment.setCustomer(customer);
        appointment = appointmentRepository.save(appointment);
        reminderService.createReminderForAppointment(appointment);
        return appointmentMapper.toAppointmentResponse(appointment);
    }

    //thay đổi lịch hẹn customer yêu cầu
    @Transactional
    public AppointmentResponse changeAppointmentForCustomer(Long appointmentId, ChangeAppointmentByCustomerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        validateAppointmentAvailableForChange(appointment, request.getRequestedDate(), request.getRequestedShift());
        validateCanChangeAppointment(appointment);

        if (appointment.getTreatmentStep().getStatus().equalsIgnoreCase("COMPLETED")
                || appointment.getTreatmentStep().getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }

        if (request.getRequestedDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        request.setRequestedShift(request.getRequestedShift().toUpperCase());
        appointmentMapper.requestChangeAppointment(appointment, request);
        appointment.setStatus("PENDING_CHANGE");
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    //confirm change appointment by doctor and manager
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    @Transactional
    public AppointmentResponse confirmChangeAppointment(Long id, ConfirmChangeAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        validateCanChangeAppointment(appointment);
        if (!"PENDING_CHANGE".equalsIgnoreCase(appointment.getStatus())) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        switch (request.getStatus().toUpperCase()) {
            case "CONFIRMED":
                boolean isAvailable = isDoctorAvailable(appointment.getDoctor().getId(), appointment.getRequestedDate(), appointment.getRequestedShift());
                if (!isAvailable) {
                    throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
                }
                reminderRepository.deleteByAppointment_Id(appointment.getId());
                appointment.setAppointmentDate(appointment.getRequestedDate());
                appointment.setShift(appointment.getRequestedShift());
                reminderService.createReminderForAppointment(appointment);
                break;
            case "REJECTED":
                appointment.setNotes(request.getNotes());
                break;
            default:
                throw new AppException(ErrorCode.STATUS_IS_INVALID);
        }
        appointment.setRequestedDate(null);
        appointment.setRequestedShift(null);
        appointment.setStatus(request.getStatus().toUpperCase());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse changeAppointmentForManagerOrDoctor(Long appointmentId, ChangeAppointmentByDoctorOrManagerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        validateCanChangeAppointment(appointment);
        validateAppointmentAvailableForChange(appointment, request.getAppointmentDate(), request.getShift());

        if (appointment.getTreatmentStep().getStatus().equalsIgnoreCase("COMPLETED")
                || appointment.getTreatmentStep().getStatus().equalsIgnoreCase("CANCELLED")) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setShift(request.getShift().toUpperCase());

        appointment.setStatus("CONFIRMED");
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        reminderService.createReminderForAppointment(appointment);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse cancelAppointment(AppointmentCancelRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        validateCanChangeAppointment(appointment);
        appointment.setStatus("CANCELLED");
        appointment.setNotes(request.getNote());
        reminderRepository.deleteByAppointment_Id(request.getAppointmentId());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }
}
