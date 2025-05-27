package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.TreatmentStageCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentStageUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentStageResponse;
import com.emmkay.infertility_system_api.service.TreatmentStageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-stages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentStageController {

    TreatmentStageService treatmentStageService;

    @GetMapping("")
    public ApiResponse<List<TreatmentStageResponse>> findAll() {
        return ApiResponse.<List<TreatmentStageResponse>>builder()
                .result(treatmentStageService.findAll())
                .build();
    }

    @GetMapping("/find-by-type/{typeId}")
    public ApiResponse<List<TreatmentStageResponse>> findByTypeId(@PathVariable Integer typeId) {
        return ApiResponse.<List<TreatmentStageResponse>>builder()
                .result(treatmentStageService.findByTypeId(typeId))
                .build();
    }

    @PostMapping()
    public ApiResponse<TreatmentStageResponse> createTreatmentStage(@RequestBody TreatmentStageCreateRequest request) {
        return ApiResponse.<TreatmentStageResponse>builder()
                .result(treatmentStageService.createTreatmentStages(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TreatmentStageResponse> updateTreatmentStage(@PathVariable Integer id, @RequestBody TreatmentStageUpdateRequest request) {
        return ApiResponse.<TreatmentStageResponse>builder()
                .result(treatmentStageService.updateTreatmentStage(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTreatmentStage(@PathVariable Integer id) {
        treatmentStageService.deleteTreatmentStage(id);
        return ApiResponse.<String>builder()
                .result("Treatment stage deleted successfully")
                .build();
    }
}
