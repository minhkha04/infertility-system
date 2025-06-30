package com.emmkay.infertility_system.modules.treatment.controller;

import com.emmkay.infertility_system.modules.shared.dto.request.UploadImageRequest;
import com.emmkay.infertility_system.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system.modules.shared.storage.CloudinaryService;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceCreateRequest;
import com.emmkay.infertility_system.modules.treatment.dto.request.TreatmentServiceUpdateRequest;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.treatment.dto.response.TreatmentServiceResponse;
import com.emmkay.infertility_system.modules.treatment.projection.TreatmentServiceBasicProjection;
import com.emmkay.infertility_system.modules.treatment.service.TreatmentServiceService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/treatment-services")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('MANAGER')")
public class TreatmentServiceController {

    TreatmentServiceService treatmentServiceService;
    CloudinaryService cloudinaryService;


    @PostMapping("")
    public ApiResponse<TreatmentServiceResponse> createTreatmentService(@RequestBody @Valid TreatmentServiceCreateRequest request) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.createTreatmentService(request))
                .build();
    }

    @GetMapping("")
    ApiResponse<PageResponse<TreatmentServiceBasicProjection>> searchTreatmentService(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isRemoved,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Page<TreatmentServiceBasicProjection> result = treatmentServiceService.searchTreatmentServices(name, isRemoved, page, size);
        return ApiResponse.<PageResponse<TreatmentServiceBasicProjection>>builder()
                .result(PageResponse.from(result))
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

    @DeleteMapping("/{id}")
    public ApiResponse<TreatmentServiceResponse> removeTreatmentService(@PathVariable Long id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.removeTreatmentService(id))
                .build();
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<TreatmentServiceResponse> restoreTreatmentService(@PathVariable Long id) {
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.restoreTreatmentService(id))
                .build();
    }

    @PostMapping("/{id}/upload-image")
    public ApiResponse<TreatmentServiceResponse> uploadImage(
            @ModelAttribute @Valid UploadImageRequest request,
            @PathVariable  Long id) {
        String imageUrl = cloudinaryService.uploadImage(request.getFile(), "service_img", String.valueOf(id));
        return ApiResponse.<TreatmentServiceResponse>builder()
                .result(treatmentServiceService.uploadImage(id, imageUrl))
                .build();
    }
}
