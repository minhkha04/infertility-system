package com.emmkay.infertility_system.modules.treatment.controller;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.SuggestedTreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system.modules.treatment.service.TreatmentStepService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/treatment-steps")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepController {

    TreatmentStepService treatmentStepService;

    @PutMapping("/{id}")
    public ApiResponse<TreatmentStepResponse> updateTreatmentStep(@PathVariable Long id, TreatmentStepUpdateRequest request) {
        return ApiResponse.<TreatmentStepResponse>builder()
                .result(treatmentStepService.updateTreatmentStepById(id, request))
                .build();
    }

    @PostMapping("")
    public ApiResponse<TreatmentStepResponse> createTreatmentStep(@RequestBody TreatmentStepCreateRequest request) {
        return ApiResponse.<TreatmentStepResponse>builder()
                .result(treatmentStepService.createTreatmentStep(request))
                .build();
    }

    @GetMapping("/{stepId}")
    public ApiResponse<TreatmentStepResponse> getTreatmentStepById(@PathVariable Long stepId) {
        return ApiResponse.<TreatmentStepResponse>builder()
                .result(treatmentStepService.getStepsById(stepId))
                .build();
    }

}
