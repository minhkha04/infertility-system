package com.emmkay.infertility_system.modules.feedback.service;

import com.emmkay.infertility_system.modules.feedback.enums.FeedbackStatus;
import com.emmkay.infertility_system.modules.feedback.projection.FeedBackBasicProjection;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system.modules.feedback.dto.request.FeedbackUpdateStatusRequest;
import com.emmkay.infertility_system.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system.modules.feedback.projection.InfoToFeedbackProjection;
import com.emmkay.infertility_system.modules.feedback.projection.PublicFeedbackProjection;
import com.emmkay.infertility_system.modules.shared.enums.RoleName;
import com.emmkay.infertility_system.modules.shared.exception.AppException;
import com.emmkay.infertility_system.modules.shared.exception.ErrorCode;
import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import com.emmkay.infertility_system.modules.feedback.mapper.FeedbackMapper;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.doctor.repository.DoctorRepository;
import com.emmkay.infertility_system.modules.feedback.repository.FeedbackRepository;
import com.emmkay.infertility_system.modules.shared.security.CurrentUserUtils;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentRecord;
import com.emmkay.infertility_system.modules.treatment.entity.TreatmentService;
import com.emmkay.infertility_system.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentRecordRepository;
import com.emmkay.infertility_system.modules.treatment.repository.TreatmentServiceRepository;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedbackService {

    FeedbackRepository feedbackRepository;
    UserRepository userRepository;
    TreatmentServiceRepository treatmentServiceRepository;
    TreatmentRecordRepository treatmentRecordRepository;
    FeedbackMapper feedbackMapper;
    DoctorRepository doctorRepository;


    public Page<FeedBackBasicProjection> searchFeedbacks(String customerId, String doctorId, FeedbackStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        String scope = CurrentUserUtils.getCurrentScope();
        if (scope == null ||currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        RoleName roleName = RoleName.formString(scope);
        return switch (roleName) {
            case CUSTOMER -> feedbackRepository.searchFeedBacks(customerId, null, status, pageable);
            case DOCTOR -> feedbackRepository.searchFeedBacks(null, doctorId, status, pageable);
            case MANAGER -> feedbackRepository.searchFeedBacks(customerId, doctorId, status, pageable);
            default -> throw new AppException(ErrorCode.UNAUTHENTICATED);
        };
    }

    public FeedbackResponse updateFeedback(Long feedbackId, FeedbackUpdateRequest request) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_EXISTED));
        if (!feedback.getCustomer().getId().equalsIgnoreCase(CurrentUserUtils.getCurrentUserId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        feedbackMapper.updateFeedback(feedback, request);
        feedback.setStatus(FeedbackStatus.PENDING);
        feedback.setNote("");
        feedback.setApprovedAt(null);
        feedback.setApprovedBy(null);
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public FeedbackResponse updateStatus(Long id, FeedbackUpdateStatusRequest request) {
        String currentUserId = CurrentUserUtils.getCurrentUserId();
        if  (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_EXISTED));
        User manager = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        feedback.setApprovedBy(manager);
        feedback.setApprovedAt(LocalDate.now());
        feedback.setStatus(request.getStatus());
        feedback.setNote(request.getNote());
        feedback.setApprovedAt(LocalDate.now(ZoneId.of( "Asia/Ho_Chi_Minh")) );
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }

    public FeedbackResponse createFeedback(FeedbackCreateRequest request) {

        if (feedbackRepository.existsByCustomerIdAndRecordId(request.getCustomerId(), request.getRecordId())) {
            throw new AppException(ErrorCode.FEEDBACK_IS_EXISTED);
        }

        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(request.getRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RECORD_NOT_FOUND));

        if (treatmentRecord.getStatus() != TreatmentRecordStatus.COMPLETED) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
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
        feedback.setStatus(FeedbackStatus.PENDING);
        feedback.setRecord(treatmentRecord);
        feedback.setCreatedAt(LocalDate.now(ZoneId.of( "Asia/Ho_Chi_Minh")));
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));

    }

    public Page<PublicFeedbackProjection> getApprovedFeedbacks(String doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return feedbackRepository.getFeedbackApproved( doctorId, pageable);
    }

    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_EXISTED));
        return feedbackMapper.toResponse(feedback);
    }


    public InfoToFeedbackProjection getInfoToFeedback(Long recordId) {
        return feedbackRepository.getInfoToFeedback(recordId);
    }
}
