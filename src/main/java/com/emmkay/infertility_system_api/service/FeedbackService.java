package com.emmkay.infertility_system_api.service;

import com.emmkay.infertility_system_api.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.dto.request.FeedbackUpdateStatusRequest;
import com.emmkay.infertility_system_api.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.entity.*;
import com.emmkay.infertility_system_api.exception.AppException;
import com.emmkay.infertility_system_api.exception.ErrorCode;
import com.emmkay.infertility_system_api.mapper.FeedbackMapper;
import com.emmkay.infertility_system_api.repository.*;
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
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));

    }

    public boolean isAvailableFeedBack(Long recordId) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));
        return treatmentRecord.getStatus().equalsIgnoreCase("COMPLETED");
    }
}
