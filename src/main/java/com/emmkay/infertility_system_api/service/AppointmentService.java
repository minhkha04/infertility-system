package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.entity.*;
import com.emmkay.infertility_system_api.repository.AppointmentRepository;
import com.emmkay.infertility_system_api.repository.WorkScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
                .status("Confirmed")
                .purpose(treatmentStep.getStage().getName())
                .createdAt(LocalDate.now())
                .build());
    }

    public void cancelAppointmentsByRecordId(Long recordId) {
        List<String> cancellableStatuses = List.of("Pending", "Confirmed");
        appointmentRepository.updateStatusByRecordIdNative(
                  recordId, cancellableStatuses, "Cancelled"
        );
    }

    public boolean isDoctorAvailable(String doctorId, LocalDate date, String shift) {
        Optional<WorkSchedule> workScheduleOpt = workScheduleRepository
                .findByDoctorIdAndWorkDate(doctorId, date);

        if (workScheduleOpt.isEmpty()) return false;

        String actualShift = workScheduleOpt.get().getShift();


        // Nếu bác sĩ không làm ca đó (không phải ca tương ứng và cũng không phải full_day)
        if (!actualShift.equals(shift) && !"full_day".equals(actualShift)) {
            return false;
        }

        // Đếm số lịch trong ca cụ thể (morning hoặc afternoon)
        int shiftAppointmentCount = appointmentRepository
                .countActiveByDoctorIdAndDateAndShift(doctorId, date, shift);

        return shiftAppointmentCount < 10;
    }
}
