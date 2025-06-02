package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.entity.*;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.TreatmentRecordMapper;
import com.emmkay.infertility_system_api.repository.*;
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
public class TreatmentRecordService {

    TreatmentRecordRepository treatmentRecordRepository;
    TreatmentStageRepository treatmentStageRepository;
    UserRepository userRepository;
    DoctorRepository doctorRepository;
    TreatmentRecordMapper treatmentRecordMapper;
    TreatmentStepService treatmentStepService;
    AppointmentService appointmentService;

    @Transactional
    public TreatmentRecordResponse creatTreatmentRecord(
            TreatmentService treatmentService,
            String customerId,
            String doctorId,
            LocalDate startDate,
            String shift,
            LocalDate cd1Date

    ) {

        if (treatmentRecordRepository.existsByCustomerIdAndStatusIn(
                customerId, List.of("PENDING", "INPROGRESS")
        )) {
            throw new AppException(ErrorCode.TREATMENT_ALREADY_IN_PROGRESS);
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));

        if (appointmentService.isDoctorAvailable(doctorId, startDate, shift)) {
            throw new AppException(ErrorCode.DOCTOR_NOT_AVAILABLE);
        }

        TreatmentRecord treatmentRecord = TreatmentRecord.builder()
                .customer(customer)
                .doctor(doctor)
                .service(treatmentService)
                .startDate(startDate)
                .status("PENDING")
                .createdDate(LocalDate.now())
                .cd1Date(cd1Date)
                .build();
        TreatmentRecord saveTreatmentRecord = treatmentRecordRepository.save(treatmentRecord);

        List<TreatmentStage> stages = treatmentStageRepository.findByTypeIdOrderByOrderIndexAsc(treatmentService.getType().getId());
        List<TreatmentStep> steps = treatmentStepService.buildSteps(saveTreatmentRecord, stages, startDate);

        TreatmentStep firstStep = steps.stream()
                .filter(step -> step.getStage().getOrderIndex() == 1)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_STEP_NOT_FOUND));

        appointmentService.createInitialAppointment(customer, doctor, startDate, shift, firstStep);

        TreatmentRecordResponse treatmentRecordResponse = treatmentRecordMapper.toTreatmentRecordResponse(saveTreatmentRecord);
        treatmentRecordResponse.setTreatmentSteps(treatmentStepService.saveAll(steps));
        return treatmentRecordResponse;
    }


    @Transactional
    public void cancelTreatmentRecord(Long recordId, String customerId) {
        TreatmentRecord record = treatmentRecordRepository.findByIdAndCustomerId(recordId, customerId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (record.getStatus().equals("COMPLETED") || record.getStatus().equals("CANCELLED")) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_TREATMENT);
        }

        record.setStatus("CANCELLED");
        treatmentRecordRepository.save(record);
        treatmentStepService.cancelStepsByRecordId(recordId);
        appointmentService.cancelAppointmentsByRecordId(recordId);
    }
}
