package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentRecordResponse;
import com.emmkay.infertility_system_api.service.TreatmentRecordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
