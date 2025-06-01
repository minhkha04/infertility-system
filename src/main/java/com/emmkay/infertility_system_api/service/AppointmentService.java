package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.entity.Appointment;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.TreatmentStep;
import com.emmkay.infertility_system_api.entity.User;
import com.emmkay.infertility_system_api.repository.AppointmentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentService {

    AppointmentRepository appointmentRepository;

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
}
