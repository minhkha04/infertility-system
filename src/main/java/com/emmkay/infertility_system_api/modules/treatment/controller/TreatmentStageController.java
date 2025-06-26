package com.emmkay.infertility_system_api.modules.treatment.controller;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentStageService;
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
@PreAuthorize("hasRole('MANAGER')")
public class TreatmentStageController {

    TreatmentStageService treatmentStageService;

    @GetMapping("/{typeId}/find-by-type")
    public ApiResponse<List<TreatmentStageResponse>> findByTypeId(@PathVariable Long typeId) {
        return ApiResponse.<List<TreatmentStageResponse>>builder()
                .result(treatmentStageService.findByTypeId(typeId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TreatmentStageResponse> updateTreatmentStage(@PathVariable Long id, @RequestBody TreatmentStageUpdateRequest request) {
        return ApiResponse.<TreatmentStageResponse>builder()
                .result(treatmentStageService.updateTreatmentStage(id, request))
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
