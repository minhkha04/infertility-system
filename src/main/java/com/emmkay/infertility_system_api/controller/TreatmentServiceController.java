package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.TreatmentServiceCreationRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system_api.service.TreatmentServiceService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-service")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentServiceController {

    TreatmentServiceService treatmentServiceService;

    @PostMapping("")
    public ApiResponse<TreatmentServiceResponse> createTreatmentService(@RequestBody @Valid TreatmentServiceCreationRequest request) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.createTreatmentService(request))
                .build();
    }

    @GetMapping("")
    public ApiResponse<List<TreatmentServiceResponse>> findAll() {
        return ApiResponse.<List<TreatmentServiceResponse>>builder()
                .result(treatmentServiceService.findAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TreatmentServiceResponse> findById(@PathVariable Integer id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.findById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TreatmentServiceResponse> updateTreatmentService(
            @PathVariable Integer id,
            @RequestBody @Valid TreatmentServiceUpdateRequest request) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.updateTreatmentService(id, request))
                .build();
    }

    @GetMapping("/not-removed")
    public ApiResponse<List<TreatmentServiceResponse>> findAllNotRemoved() {
        return ApiResponse.<List<TreatmentServiceResponse>>builder()
                .result(treatmentServiceService.findAllNotRemoved())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> removeTreatmentService(@PathVariable Integer id) {
        treatmentServiceService.removeTreatmentService(id);
        return ApiResponse.<String>builder()
                .result("Treatment service removed successfully")
                .build();
    }

    @PutMapping("/restore/{id}")
    public ApiResponse<TreatmentServiceResponse> restoreTreatmentService(@PathVariable Integer id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.restoreTreatmentService(id))
                .build();
    }
}
