package com.emmkay.infertility_system_api.modules.treatment.controller;


import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.RegisterServiceRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.treatment.enums.TreatmentRecordStatus;
import com.emmkay.infertility_system_api.modules.treatment.projection.TreatmentRecordBasicProjection;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentRecordService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/treatment-records")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentRecordController {

    TreatmentRecordService treatmentRecordService;


    @GetMapping("")
    public ApiResponse<PageResponse<TreatmentRecordBasicProjection>> findAllForCustomer(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) TreatmentRecordStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<TreatmentRecordBasicProjection> result = treatmentRecordService.searchTreatmentRecords(customerId, doctorId, status, page, size);
        return ApiResponse.<PageResponse<TreatmentRecordBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TreatmentRecordResponse> findById(@PathVariable Long id) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.getTreatmentRecordById(id))
                .build();
    }

    @PutMapping("/{recordId}/status")
    public ApiResponse<TreatmentRecordResponse> updateStatusTreatmentRecord(@PathVariable Long recordId, @RequestParam TreatmentRecordStatus status) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.updateStatusTreatmentRecord(recordId, status))
                .build();
    }

    @PutMapping("/{recordId}/cd1")
    public ApiResponse<TreatmentRecordResponse> updateCd1TreatmentRecord(@PathVariable Long recordId, @RequestParam LocalDate cd1) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.updateCd1TreatmentRecord(recordId, cd1))
                .build();
    }


    @PostMapping("/register")
    public ApiResponse<String> registerTreatmentService(
            @RequestBody @Valid RegisterServiceRequest request) {
        treatmentRecordService.creatTreatmentRecord(request);
        return ApiResponse.<String>builder()
                .result("Đăng ký dịch vụ thành công")
                .build();
    }

    @DeleteMapping("/{recordId}/cancel")
    public ApiResponse<String> cancelTreatmentRecord(@PathVariable Long recordId) {
        treatmentRecordService.cancelTreatmentRecord(recordId);
        return ApiResponse.<String>builder()
                .result("Hủy dịch vụ thành công")
                .build();
    }
}
