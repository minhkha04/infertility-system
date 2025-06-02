package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system_api.dto.request.AppointmentUpdateStatusRequest;
import com.emmkay.infertility_system_api.dto.request.RescheduleAppointmentRequest;
import com.emmkay.infertility_system_api.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.entity.*;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.AppointmentMapper;
import com.emmkay.infertility_system_api.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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


    public Appointment createInitialAppointment(
            User customer,
            Doctor doctor,
            LocalDate date,
            String shift,
            TreatmentStep treatmentStep
    ) {
        return appointmentRepository.save(Appointment.builder()
                .customer(customer)
                .doctor(doctor)
                .appointmentDate(date)
                .shift(shift)
                .treatmentStep(treatmentStep)
                .status("CONFIRMED")
                .purpose(treatmentStep.getStage().getName())
                .createdAt(LocalDate.now())
                .build());
    }

    public void cancelAppointmentsByRecordId(Long recordId) {
        List<String> cancellableStatuses = List.of("CONFIRMED");
        appointmentRepository.updateStatusByRecordIdNative(
                recordId, cancellableStatuses, "CANCELLED"
        );
    }

    public boolean isDoctorAvailable(String doctorId, LocalDate date, String shift) {
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

    @PreAuthorize("hasRole('CUSTOMER') or hasRole('MANAGER')")
    public List<AppointmentResponse> getAppointmentsForCustomer(String customerId) {
        return appointmentRepository.findAppointmentByCustomerIdAndStatusNot(customerId, "CANCELLED")
                .stream()
                .map(appointmentMapper::toAppointmentResponse)
                .toList();
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public List<AppointmentResponse> getAppointmentsForDoctor(String customerId) {
        return appointmentRepository.findAppointmentByDoctorIdAndStatusNot(customerId, "CANCELLED")
                .stream()
                .map(appointmentMapper::toAppointmentResponse)
                .toList();
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public List<AppointmentResponse> getAppointmentsForDoctorToday(String customerId) {
        return appointmentRepository.findAppointmentByDoctorIdAndStatusNotAndAppointmentDate(customerId, "CANCELLED", LocalDate.now())
                .stream()
                .map(appointmentMapper::toAppointmentResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER') or hasRole('CUSTOMER')")
    public AppointmentResponse rescheduleAppointment(Long appointmentId, RescheduleAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));


        // Chỉ cho đổi trong 14 ngày tới
        LocalDate today = LocalDate.now();
        if (request.getAppointmentDate().isBefore(today) || request.getAppointmentDate().isAfter(today.plusDays(14))) {
            throw new AppException(ErrorCode.DATE_OUT_OF_RANGE);
        }

        // Kiểm tra ca đó có nằm trong lịch làm việc rảnh không
        String doctorId = appointment.getDoctor().getId();
        boolean isAvailable = isDoctorAvailable(doctorId, request.getAppointmentDate(), request.getShift());

        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        if ("COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new AppException(ErrorCode.APPOINTMENT_IS_COMPLETED);
        }
        request.setShift(request.getShift().toUpperCase());
        appointmentMapper.updateStatusAppointment(appointment, request);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse scheduleStepAppointment(AppointmentCreateRequest req) {
        TreatmentStep step = treatmentStepRepository.findById(req.getTreatmentTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_TYPE_NOT_EXISTED));

        if (step.getScheduledDate() != null) {
            throw new AppException(ErrorCode.TREATMENT_STEP_HAS_SCHEDULE);
        }

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean isAvailable = isDoctorAvailable(req.getDoctorId(), req.getAppointmentDate(), req.getShift());
        if (!isAvailable) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }
        Appointment appointment = appointmentMapper.toAppointment(req);
        appointment.setDoctor(doctor);
        appointment.setTreatmentStep(step);
        appointment.setStatus("CONFIRMED");
        appointment.setPurpose(step.getStage().getName());
        appointment.setCreatedAt(LocalDate.now());
        appointment.setCustomer(customer);
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('MANAGER')")
    public AppointmentResponse updateAppointmentStatus(Long id, AppointmentUpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        if ("COMPLETED".equalsIgnoreCase(appointment.getStatus()) ||
                "CANCELLED".equalsIgnoreCase(appointment.getStatus())) {
            throw new AppException(ErrorCode.CAN_NOT_BE_UPDATED_STATUS);
        }

        appointment.setStatus(request.getStatus().toUpperCase());
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }
        return appointmentMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }


}
