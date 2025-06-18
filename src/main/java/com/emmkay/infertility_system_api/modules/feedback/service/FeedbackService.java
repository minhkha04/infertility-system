package com.emmkay.infertility_system_api.modules.feedback.service;

import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateStatusRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.modules.shared.exception.AppException;
import com.emmkay.infertility_system_api.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system_api.modules.feedback.entity.Feedback;
import com.emmkay.infertility_system_api.modules.feedback.mapper.FeedbackMapper;
import com.emmkay.infertility_system_api.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system_api.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system_api.modules.feedback.repository.FeedbackRepository;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system_api.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system_api.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import com.emmkay.infertility_system_api.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackService {

    FeedbackRepository feedbackRepository;
    UserRepository userRepository;
    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentRecordRepository treatmentRecordRepository;
    FeedbackMapper feedbackMapper;
    DoctorRepository doctorRepository;


    public FeedbackResponse updateFeedback(Long feedbackId, FeedbackUpdateRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_EXISTED));

        feedbackMapper.updateFeedback(feedback, request);
        feedback.setStatus("PENDING");
        feedback.setNote("");
        feedback.setSubmitDate(null);
        feedback.setApprovedBy(null);
        feedback.setIsApproved(false);
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }

    @PreAuthorize( "hasRole('MANAGER')")
    public List<FeedbackResponse> getAll() {
        return feedbackRepository.findAll()
                .stream()
                .map(feedbackMapper::toResponse)
                .toList();
    }

    public List<FeedbackResponse> getFeedbackByDoctorAndApproval(String doctorId, boolean approval) {
        return feedbackRepository.findByDoctorIdAndIsApproved(doctorId, approval)
                .stream()
                .map(feedbackMapper::toResponse)
                .toList();
    }

    public List<FeedbackResponse> getFeedbackByCustomer(String customerId) {
       return feedbackRepository.findByCustomerId(customerId)
               .stream()
               .map(feedbackMapper::toResponse).toList();
    }

    @PreAuthorize( "hasRole('MANAGER')")
    public FeedbackResponse updateApproval(Long id, FeedbackUpdateStatusRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_EXISTED));
        User manager = userRepository.findById(request.getApproveBy())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        feedback.setIsApproved(request.isApproved());
        feedback.setApprovedBy(manager);
        feedback.setSubmitDate(LocalDate.now());
        feedback.setStatus(request.getStatus());
        feedback.setNote(request.getNote());
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse createFeedback(FeedbackCreateRequest request) {

        if(!isAvailableFeedBack(request.getRecordId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        if (feedbackRepository.existsByCustomerIdAndRecordId(request.getCustomerId(), request.getRecordId())) {
            throw new AppException(ErrorCode.FEEDBACK_IS_EXISTED);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(request.getRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_EXISTED));
        }

        TreatmentService treatmentService = treatmentServiceRepository.getTreatmentServicesById((request.getServiceId()))
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_SERVICE_NOT_EXISTED));

        Feedback feedback = feedbackMapper.toFeedback(request);
        feedback.setService(treatmentService);
        feedback.setCustomer(customer);
        feedback.setDoctor(doctor);
        feedback.setIsApproved(false);
        feedback.setStatus("PENDING");
        feedback.setRecord(treatmentRecord);
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));

    }

    public boolean isAvailableFeedBack(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        return treatmentRecord.getStatus().equalsIgnoreCase("COMPLETED");
    }
}
