package com.emmkay.infertility_system_api.modules.feedback.controller;

import com.emmkay.infertility_system_api.modules.feedback.projection.PublicFeedbackProjection;
import com.emmkay.infertility_system_api.modules.feedback.service.FeedbackService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/public/feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicFeedbackController {

    FeedbackService feedbackService;

    @GetMapping("")
    public ApiResponse<PageResponse<PublicFeedbackProjection>> getApprovedFeedbacks(
            @RequestParam String doctorId,
           @RequestParam(defaultValue = "0") int page,
           @RequestParam(defaultValue = "10") int size
    ) {
        Page<PublicFeedbackProjection> result = feedbackService.getApprovedFeedbacks(doctorId, page, size);
        return ApiResponse.<PageResponse<PublicFeedbackProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }
}
