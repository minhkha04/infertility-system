package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.TreatmentTypeCreateRequest;
import com.emmkay.infertility_system_api.dto.request.TreatmentTypeUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.TreatmentTypeResponse;
import com.emmkay.infertility_system_api.service.TreatmentTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-type")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TreatmentTypeController {

    TreatmentTypeService treatmentTypeService;

    @GetMapping("")
    public ApiResponse<List<TreatmentTypeResponse>> findAll() {
        return ApiResponse.<List<TreatmentTypeResponse>>builder()
                .result(treatmentTypeService.findAll())
                .build();
    }

    @PostMapping("")
    public ApiResponse<TreatmentTypeResponse> createTreatmentType(@RequestBody  @Valid TreatmentTypeCreateRequest request) {
        return ApiResponse.<TreatmentTypeResponse>builder()
                .result(treatmentTypeService.createTreatmentType(request))
                .build();
    }

    @PutMapping("{id}")
    public ApiResponse<TreatmentTypeResponse> updateTreatmentType(@PathVariable Integer id, @RequestBody @Valid TreatmentTypeUpdateRequest request) {
        return ApiResponse.<TreatmentTypeResponse>builder()
                .result(treatmentTypeService.updateTreatmentType(id, request))
                .build();
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> deleteTreatmentType(@PathVariable Integer id) {
        treatmentTypeService.deleteTreatmentType(id);
        return ApiResponse.<String>builder()
                .message("Xóa phương pháp điều trị thành công")
                .build();
    }

    @GetMapping("find-by-name/{name}")
    public ApiResponse<List<TreatmentTypeResponse>> findByName(@PathVariable String name) {
        return ApiResponse.<List<TreatmentTypeResponse>>builder()
                .result(treatmentTypeService.findByName(name))
                .build();
    }

}
