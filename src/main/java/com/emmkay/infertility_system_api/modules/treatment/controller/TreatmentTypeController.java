package com.emmkay.infertility_system_api.modules.treatment.controller;

import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeCreateRequest;
import com.emmkay.infertility_system_api.modules.treatment.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treatment-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentTypeController {

    TreatmentTypeService treatmentTypeService;

    @GetMapping("")
    public ApiResponse<List<TreatmentTypeResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<List<TreatmentTypeResponse>>builder()
                .result(treatmentTypeService.findAll(page, size))
                .build();
    }

    @PostMapping("")
    public ApiResponse<TreatmentTypeResponse> createTreatmentType(@RequestBody @Valid TreatmentTypeCreateRequest request) {
        return ApiResponse.<TreatmentTypeResponse>builder()
                .result(treatmentTypeService.createTreatmentType(request))
                .build();
    }

    @PutMapping("{id}")
    public ApiResponse<TreatmentTypeResponse> updateTreatmentType(@PathVariable Long id, @RequestBody @Valid TreatmentTypeUpdateRequest request) {
        return ApiResponse.<TreatmentTypeResponse>builder()
                .result(treatmentTypeService.updateTreatmentType(id, request))
                .build();
    }

}
