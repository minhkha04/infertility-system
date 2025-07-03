package com.emmkay.infertility_system.modules.doctor.controller;

import com.emmkay.infertility_system.modules.doctor.dto.response.DoctorResponse;
import com.emmkay.infertility_system.modules.doctor.projection.DoctorBasicProjection;
import com.emmkay.infertility_system.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.shared.dto.response.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicDoctorController {

    DoctorService doctorService;

    @GetMapping("")
    public ApiResponse<PageResponse<DoctorBasicProjection>> getPublicBasicDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<DoctorBasicProjection> result = doctorService.getPublicDoctors(page, size);
        return ApiResponse.<PageResponse<DoctorBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{doctorId}")
    public ApiResponse<DoctorResponse> getDetailDoctor(
            @PathVariable String doctorId,
            @RequestParam (defaultValue = "true") Boolean isPublic
    ) {
        return ApiResponse.<DoctorResponse>builder()
                .result(doctorService.getDoctorById(doctorId, isPublic))
                .build();
    }
}
