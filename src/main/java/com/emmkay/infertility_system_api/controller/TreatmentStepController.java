package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.TreatmentStepUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentStepResponse;
import com.emmkay.infertility_system_api.service.TreatmentStepService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/treatment-step")
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
}
