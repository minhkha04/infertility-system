package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.TreatmentServiceCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentServiceRegisterRequest;
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
    public ApiResponse<TreatmentServiceResponse> createTreatmentService(@RequestBody @Valid TreatmentServiceCreateRequest request) {
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
    public ApiResponse<TreatmentServiceResponse> findById(@PathVariable Long id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.findById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TreatmentServiceResponse> updateTreatmentService(
            @PathVariable Long id,
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
    public ApiResponse<TreatmentServiceResponse> removeTreatmentService(@PathVariable Long id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.removeTreatmentService(id))
                .build();
    }

    @PutMapping("/restore/{id}")
    public ApiResponse<TreatmentServiceResponse> restoreTreatmentService(@PathVariable Long id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.restoreTreatmentService(id))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<String> registerTreatmentService(
            @RequestBody @Valid TreatmentServiceRegisterRequest request) {
        treatmentServiceService.registerTreatmentService(request);
        return ApiResponse.<String>builder()
                .result("Đăng ký dịch vụ thành công")
                .build();
    }

    @DeleteMapping("/cancel/{recordId}/{customerId}")
    public ApiResponse<String> cancelTreatmentRecord(@PathVariable Long recordId, @PathVariable String customerId) {
        treatmentServiceService.cancelTreatmentService(recordId, customerId);
        return ApiResponse.<String>builder()
                .result("Hủy dịch vụ thành công")
                .build();
    }
}
