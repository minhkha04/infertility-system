package com.emmkay.infertility_system_api.modules.feedback.controller;

import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateStatusRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.modules.feedback.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackController {

    FeedbackService feedbackService;

    @Operation(summary = "for manager")
    @GetMapping("")
    public ApiResponse<Page<FeedbackResponse>> getAllFeedback(@RequestParam Integer page, @RequestParam Integer size) {
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(feedbackService.getAll(page, size))
                .build();
    }

    @Operation(summary = "for manager")
    @GetMapping("/get-all")
    public ApiResponse<List<FeedbackResponse>> getAllFeedbacks() {
        return ApiResponse.<List<FeedbackResponse>>builder()
                .result(feedbackService.getAll())
                .build();
    }

    @Operation(summary = "for doctor")
    @GetMapping("/for-doctor/{isApproval}/{doctorId}")
    public ApiResponse<List<FeedbackResponse>> getFeedbacksByDoctorApprovalStatus(@PathVariable Boolean isApproval, @PathVariable String doctorId) {
        return ApiResponse.<List<FeedbackResponse>>builder()
                .result(feedbackService.getFeedbackByDoctorAndApproval(doctorId, isApproval))
                .build();
    }

    @Operation(summary = "customer feedback")
    @GetMapping("/for-customer/{customerId}")
    public ApiResponse<List<FeedbackResponse>> getFeedbacksByDoctorApprovalStatus(@PathVariable String customerId) {
        return ApiResponse.<List<FeedbackResponse>>builder()
                .result(feedbackService.getFeedbackByCustomer(customerId))
                .build();
    }


    @Operation(summary = "confirm feedback")
    @PutMapping("/{id}")
    public ApiResponse<FeedbackResponse> confirmFeedback(@RequestBody @Valid FeedbackUpdateStatusRequest request, @PathVariable Long id) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.updateApproval(id, request))
                .build();
    }

    @Operation(summary = "create feedback")
    @PostMapping("")
    public ApiResponse<FeedbackResponse> createFeedback(@RequestBody @Valid FeedbackCreateRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.createFeedback(request))
                .build();
    }

    @GetMapping("/isValidToFeedback/{recordId}")
    public ApiResponse<Boolean> isValidToFeedback(@PathVariable Long recordId) {
        return  ApiResponse.<Boolean>builder()
                .result(feedbackService.isAvailableFeedBack(recordId))
                .build();
    }

    @PutMapping("/update-feedback/{feedbackId}")
    public ApiResponse<FeedbackResponse> updateFeedback(@PathVariable Long feedbackId, @RequestBody @Valid FeedbackUpdateRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.updateFeedback(feedbackId, request))
                .build();
    }

}
