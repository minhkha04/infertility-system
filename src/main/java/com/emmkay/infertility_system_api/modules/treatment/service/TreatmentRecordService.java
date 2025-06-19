package com.emmkay.infertility_system_api.modules.treatment.service;

import com.emmkay.infertility_system_api.modules.manager.projection.ManagerDashboardStatisticsProjection;
import com.emmkay.infertility_system_api.modules.manager.dto.response.ManagerDashboardStatisticsResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.treatment.mapper.TreatmentRecordMapper;
import com.emmkay.infertility_system_api.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system_api.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStage;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentStep;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentStageRepository;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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

//    public boolean isPaid(Long recordId) {
//        return treatmentRecordRepository.findIsPaidById(recordId);
//    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('DOCTOR')")
    public TreatmentRecordResponse updateTreatmentRecord(Long recordId, String status) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        treatmentRecord.setStatus(status.toUpperCase());
        return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(treatmentRecord));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public ManagerDashboardStatisticsResponse getManagerDashboardStatistics() {
        ManagerDashboardStatisticsProjection tmp = treatmentRecordRepository.getManagerDashboardStatistics();
        return ManagerDashboardStatisticsResponse.builder()
                .totalCustomersTreated(tmp.getTotalCustomersTreated())
                .totalRevenue(tmp.getTotalRevenue())
                .totalAppointments(tmp.getTotalAppointments())
                .build();
    }

    public List<TreatmentRecordResponse> getAllTreatmentRecordsByCustomerId(String customerId) {
        List<TreatmentRecord> records = treatmentRecordRepository.findByCustomerId(customerId);
        return records.stream()
                .map(treatmentRecordMapper::toTreatmentRecordResponse)
                .peek(response -> response.setTreatmentSteps(
                        treatmentStepService.getStepsByRecordId(response.getId())))
                .toList();
    }

    @PreAuthorize("hasRole('MANAGER')")
    public List<TreatmentRecordResponse> getAllTreatmentRecords() {
        List<TreatmentRecord> records = treatmentRecordRepository.findAll();
        return records.stream()
                .map(treatmentRecordMapper::toTreatmentRecordResponse)
                .peek(response -> response.setTreatmentSteps(
                        treatmentStepService.getStepsByRecordId(response.getId())))
                .toList();
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public List<TreatmentRecordResponse> getAllTreatmentRecordsByDoctorId(String doctorId) {
        List<TreatmentRecord> records = treatmentRecordRepository.findByDoctorId(doctorId);
        return records.stream()
                .map(treatmentRecordMapper::toTreatmentRecordResponse)
                .peek(response -> response.setTreatmentSteps(
                        treatmentStepService.getStepsByRecordId(response.getId())))
                .toList();
    }

    public TreatmentRecordResponse getTreatmentRecordById(Long treatmentRecordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(treatmentRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        TreatmentRecordResponse treatmentRecordResponse = treatmentRecordMapper
                .toTreatmentRecordResponse(treatmentRecord);
        treatmentRecordResponse.setTreatmentSteps(treatmentStepService.getStepsByRecordId(treatmentRecord.getId()));
        return treatmentRecordResponse;
    }

    @Transactional
    public TreatmentRecordResponse creatTreatmentRecord(
            TreatmentService treatmentService,
            String customerId,
            String doctorId,
            LocalDate startDate,
            String shift,
            LocalDate cd1Date

    ) {
//      check has Record before
//        if (treatmentRecordRepository.existsByCustomerIdAndStatusIn(
//                customerId, List.of("PENDING", "INPROGRESS")
//        )) {
//            throw new AppException(ErrorCode.TREATMENT_ALREADY_IN_PROGRESS);
//        }

        if (startDate.isBefore(LocalDate.now().plusDays(1))) {
            throw new AppException(ErrorCode.INVALID_START_DATE);
        }
        Doctor doctor;
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!doctorId.isEmpty()) {
             doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        } else {
            doctor = doctorService.findBestDoctor(startDate, shift)
                    .orElseThrow(() -> new AppException(ErrorCode.USERNAME_EXISTED));
        }
        if (!appointmentService.isDoctorAvailable(doctor.getId(), startDate, shift)) {
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

        if (record.getStatus().equals("COMPLETED")
                || record.getStatus().equals("CANCELLED")
                || record.getStatus().equals("INPROGRESS")) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_TREATMENT);
        }

        record.setStatus("CANCELLED");
        treatmentRecordRepository.save(record);
        treatmentStepService.cancelStepsByRecordId(recordId);
    }

    public TreatmentRecordResponse updateCd1(Long recordId, LocalDate cd1) {
        TreatmentRecord record = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (record.getStatus().equals("COMPLETED") || record.getStatus().equals("CANCELLED")) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_TREATMENT);
        }
        record.setCd1Date(cd1);
        return treatmentRecordMapper.toTreatmentRecordResponse(treatmentRecordRepository.save(record));
    }

}
