package com.emmkay.infertility_system.modules.treatment.controller;

import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentStageSelectProjection;
import com.emmkay.infertility_system.modules.treatment.service.TreatmentStageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treatment-stages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStageController {

    TreatmentStageService treatmentStageService;

    @GetMapping("/{serviceId}/find-by-service")
    public ApiResponse<List<TreatmentStageResponse>> findByTypeId(@PathVariable Long serviceId) {
        return ApiResponse.<List<TreatmentStageResponse>>builder()
                .result(treatmentStageService.findByServiceId(serviceId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TreatmentStageResponse> updateTreatmentStage(@PathVariable Long id, @RequestBody TreatmentStageUpdateRequest request) {
        return ApiResponse.<TreatmentStageResponse>builder()
                .result(treatmentStageService.updateTreatmentStage(id, request))
                .build();
    }

    @GetMapping("/{serviceId}/select")
    public ApiResponse<List<TreatmentStageSelectProjection>> getStageSelect(@PathVariable Long serviceId) {
        return ApiResponse.<List<TreatmentStageSelectProjection>>builder()
                .result(treatmentStageService.getTreatmentStageSelect(serviceId))
                .build();
    }

//    TODO: add isRomoved field to TreatmentStage entity and implement delete method, and update logic add TreatmentStep
//    @DeleteMapping("/{id}")
//    public ApiResponse<String> deleteTreatmentStage(@PathVariable Long id) {
//        treatmentStageService.deleteTreatmentStage(id);
//        return ApiResponse.<String>builder()
//                .result("Xóa giai đoạn điều trị thành công")
//                .build();
//    }
}
