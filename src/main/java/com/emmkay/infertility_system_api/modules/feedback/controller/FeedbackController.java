package com.emmkay.infertility_system_api.modules.feedback.controller;

import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackCreateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateRequest;
import com.emmkay.infertility_system_api.modules.feedback.dto.request.FeedbackUpdateStatusRequest;
import com.emmkay.infertility_system_api.modules.feedback.enums.FeedbackStatus;
import com.emmkay.infertility_system_api.modules.feedback.projection.FeedBackBasicProjection;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.feedback.dto.response.FeedbackResponse;
import com.emmkay.infertility_system_api.modules.feedback.service.FeedbackService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackController {

    FeedbackService feedbackService;

    @GetMapping("")
    public ApiResponse<PageResponse<FeedBackBasicProjection>> searchFeedbacks(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) FeedbackStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<FeedBackBasicProjection> result = feedbackService.searchFeedbacks(customerId, doctorId, status, page, size);
        return ApiResponse.<PageResponse<FeedBackBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.getFeedbackById(id))
                .build();

    }

    @PutMapping("/{id}/status")
    public ApiResponse<FeedbackResponse> updateStatus(@RequestBody @Valid FeedbackUpdateStatusRequest request, @PathVariable Long id) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.updateStatus(id, request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<FeedbackResponse> updateFeedback(@PathVariable Long id, @RequestBody @Valid FeedbackUpdateRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.updateFeedback(id, request))
                .build();
    }

    @PostMapping("")
    public ApiResponse<FeedbackResponse> createFeedback(@RequestBody @Valid FeedbackCreateRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .result(feedbackService.createFeedback(request))
                .build();
    }

}
