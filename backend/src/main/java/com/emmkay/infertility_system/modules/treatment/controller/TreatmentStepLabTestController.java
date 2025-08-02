package com.emmkay.infertility_system.modules.treatment.controller;

import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStepLabTestUpdateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStepLabTestResponse;
import com.emmkay.infertility_system.modules.treatment.service.TreatmentStepLabTestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treatment-test-labs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStepLabTestController {

    TreatmentStepLabTestService treatmentStepLabTestService;

    @PostMapping("")
    public ApiResponse<TreatmentStepLabTestResponse> createTreatmentStepLabTest( @RequestBody TreatmentStepLabTestCreateRequest request) {
        TreatmentStepLabTestResponse response = treatmentStepLabTestService.save(request);
        return ApiResponse.<TreatmentStepLabTestResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{stepId}")
    public ApiResponse<List<TreatmentStepLabTestResponse>> getTreatmentStepLabTestById(@PathVariable Long stepId) {
        return ApiResponse.<List<TreatmentStepLabTestResponse>>builder()
                .result(treatmentStepLabTestService.getTreatmentStepLabTestByStepId(stepId))
                .build();
    }

    @PutMapping("/{labTestId}")
    public ApiResponse<TreatmentStepLabTestResponse> update(@PathVariable Long labTestId,@RequestBody TreatmentStepLabTestUpdateRequest request) {
        return ApiResponse.<TreatmentStepLabTestResponse>builder()
                .result(treatmentStepLabTestService.update(labTestId, request))
                .build();
    }

    @DeleteMapping("/{labTestId}")
    public ApiResponse<String> delete(@PathVariable Long labTestId) {
        treatmentStepLabTestService.delete(labTestId);
        return ApiResponse.<String>builder()
                .result("Xóa thành công")
                .build();
    }
}
