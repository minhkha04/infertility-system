package com.emmkay.infertility_system_api.modules.treatment.controller;


import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentRecordService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/treatment-records")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentRecordController {

    TreatmentRecordService treatmentRecordService;

    @GetMapping("/find-all/manager")
    public ApiResponse<List<TreatmentRecordResponse>> findAll() {
        return ApiResponse.<List<TreatmentRecordResponse>>builder()
                .result(treatmentRecordService.getAllTreatmentRecords())
                .build();
    }

    @GetMapping("/find-all/customer/{customerId}")
    public ApiResponse<List<TreatmentRecordResponse>> findAllByCustomerId(@PathVariable String customerId) {
        return ApiResponse.<List<TreatmentRecordResponse>>builder()
                .result(treatmentRecordService.getAllTreatmentRecordsByCustomerId(customerId))
                .build();
    }

    @GetMapping("/find-all/doctor/{doctorId}")
    public ApiResponse<List<TreatmentRecordResponse>> findAllByDoctorId(@PathVariable String doctorId) {
        return ApiResponse.<List<TreatmentRecordResponse>>builder()
                .result(treatmentRecordService.getAllTreatmentRecordsByDoctorId(doctorId))
                .build();
    }

    @GetMapping("/find-by-id/{id}")
    public ApiResponse<TreatmentRecordResponse> findById(@PathVariable Long id) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.getTreatmentRecordById(id))
                .build();
    }

    @Operation(summary = "to update status", description = "INPROGRESS trong quá trình, COMPLETED hoàn thành, CANCELLED hủy, ko cho cancelled ở đây")
    @PutMapping("/update-status/{recordId}/{status}")
    public ApiResponse<TreatmentRecordResponse> updateStatus(@PathVariable Long recordId, @PathVariable String status) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.updateTreatmentRecord(recordId, status))
                .build();
    }

    @PutMapping("/update-cd1/{cd1}")
    public ApiResponse<TreatmentRecordResponse> updateCd1(@PathVariable Long recordId, @PathVariable LocalDate cd1) {
        return ApiResponse.<TreatmentRecordResponse>builder()
                .result(treatmentRecordService.updateCd1(recordId, cd1))
                .build();
    }
}
