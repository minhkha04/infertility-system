package com.emmkay.infertility_system_api.modules.doctor.controller;

import com.emmkay.infertility_system_api.modules.doctor.projection.DoctorStatisticsProjection;
import com.emmkay.infertility_system_api.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/doctor/statistics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorStatisticsController {
    DoctorService doctorService;

    @GetMapping("")
    public ApiResponse<DoctorStatisticsProjection> getStatistics() {
        return ApiResponse.<DoctorStatisticsProjection>builder()
                .result(doctorService.getStatistics())
                .build();
    }
}
