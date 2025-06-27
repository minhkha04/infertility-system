package com.emmkay.infertility_system_api.modules.appointment.service;

import com.emmkay.infertility_system_api.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system_api.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system_api.modules.appointment.dto.request.*;
import com.emmkay.infertility_system_api.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.modules.shared.enums.RoleName;
import com.emmkay.infertility_system_api.modules.shared.enums.Shift;
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
import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentStepStatus;
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

    private void validateAppointmentAvailableForChange(Appointment appointment, LocalDate dateChange, Shift shiftChange) {
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
        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
    }

    private void validateCanChangeAppointment(Appointment appointment) {
        String scope = CurrentUserUtils.getCurrentScope();
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (scope == null || scope.isBlank() || currentUserId == null || currentUserId.isBlank()) {
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

    private AppointmentResponse confirmChangeAppointment(Appointment appointment, UpdateAppointmentRequest request) {
        validateCanChangeAppointment(appointment);
        if (appointment.getStatus() != AppointmentStatus.PENDING_CHANGE) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        switch (request.getStatus()) {
            case CONFIRMED:
                boolean isAvailable = isDoctorAvailable(appointment.getDoctor().getId(), appointment.getRequestedDate(), appointment.getRequestedShift());
                if (!isAvailable) {
                    throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
                }
                reminderRepository.deleteByAppointment_Id(appointment.getId());
                appointment.setAppointmentDate(appointment.getRequestedDate());
                appointment.setShift(appointment.getRequestedShift());
                reminderService.createReminderForAppointment(appointment);
                break;
            case REJECTED:
                break;
            default:
                throw new AppException(ErrorCode.STATUS_IS_INVALID);
        }
        appointment.setRequestedDate(null);
        appointment.setRequestedShift(null);
        appointment.setStatus(request.getStatus());
        appointment.setNotes(request.getNote());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse cancelAppointment(Appointment appointment, UpdateAppointmentRequest request) {
        validateCanChangeAppointment(appointment);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setNotes(request.getNote());
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse changeAppointmentWithStatusCompleted(Appointment appointment, UpdateAppointmentRequest request) {
        validateCanChangeAppointment(appointment);
        LocalDate today = LocalDate.now();
        if (!appointment.getAppointmentDate().equals(today)) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }
        appointment.setStatus(request.getStatus());
        appointment.setNotes(request.getNote());
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
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
            case CUSTOMER -> appointmentRepository.searchAppointments(stepId, currentUserId, null, date, status, pageable);
            case DOCTOR -> appointmentRepository.searchAppointments(stepId,null, currentUserId, date, status, pageable);
            case MANAGER -> appointmentRepository.searchAppointments(stepId, customerId, doctorId, date, status, pageable);
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
    public AppointmentResponse updateStatus(Long appointmentId, UpdateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
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

    public void createInitialAppointment(User customer,Doctor doctor, LocalDate date, Shift shift, TreatmentStep treatmentStep) {
        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .customer(customer)
                .doctor(doctor)
                .appointmentDate(date)
                .shift(shift)
                .treatmentStep(treatmentStep)
                .status(AppointmentStatus.CONFIRMED)
                .createdAt(LocalDate.now())
                .build());
        reminderService.createReminderForAppointment(appointment);
    }

    @PreAuthorize("hasRole('DOCTOR')")
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
        appointment.setCreatedAt(LocalDate.now());
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
        validateAppointmentAvailableForChange(appointment, request.getRequestedDate(), request.getRequestedShift());
        validateCanChangeAppointment(appointment);

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }

        if (request.getRequestedDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        appointmentMapper.requestChangeAppointment(appointment, request);
        appointment.setStatus(AppointmentStatus.PENDING_CHANGE);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse changeAppointmentForManagerOrDoctor(Long appointmentId, ChangeAppointmentByDoctorOrManagerRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        validateCanChangeAppointment(appointment);
        validateAppointmentAvailableForChange(appointment, request.getAppointmentDate(), request.getShift());

        if (appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.COMPLETED
                || appointment.getTreatmentStep().getStatus() == TreatmentStepStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_NOT_CHANGE);
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setShift(request.getShift());

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        reminderRepository.deleteByAppointment_Id(appointment.getId());
        reminderService.createReminderForAppointment(appointment);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }
}
