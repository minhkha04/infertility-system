package com.emmkay.infertility_system_api.modules.treatment.controller;

import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import com.emmkay.infertility_system_api.modules.treatment.dto.response.ServiceDetailResponse;
import com.emmkay.infertility_system_api.modules.treatment.projection.TreatmentServiceBasicProjection;
import com.emmkay.infertility_system_api.modules.treatment.service.PublicServiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/services")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicServiceController {
    PublicServiceService publicServiceService;

    @GetMapping("")
    ApiResponse<PageResponse<TreatmentServiceBasicProjection>> searchTreatmentService(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Page<TreatmentServiceBasicProjection> result = publicServiceService.searchPublicTreatmentService(name, page, size);
        return ApiResponse.<PageResponse<TreatmentServiceBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<ServiceDetailResponse> getServiceDetail(@PathVariable Long id) {
        ServiceDetailResponse serviceDetail = publicServiceService.getServiceDetail(id);
        return ApiResponse.<ServiceDetailResponse>builder()
                .result(serviceDetail)
                .build();
    }
}
