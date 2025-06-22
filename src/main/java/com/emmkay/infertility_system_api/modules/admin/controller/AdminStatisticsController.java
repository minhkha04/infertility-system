package com.emmkay.infertility_system_api.modules.admin.controller;

import com.emmkay.infertility_system_api.modules.admin.projection.RoleCountProjection;
import com.emmkay.infertility_system_api.modules.admin.service.AdminStatisticsService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/statistics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatisticsController {

    AdminStatisticsService adminStatisticsService;

    @GetMapping("/users-by-role")
    public ApiResponse<List<RoleCountProjection>> getUserCountByRole() {
        return ApiResponse.<List<RoleCountProjection>>builder()
                .result(adminStatisticsService.getUserCountByRole())
                .build();
    }

    @GetMapping("/users-by-status")
    public ApiResponse<Map<String, Long>> getUserByStatus() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(adminStatisticsService.getUsersByStatus())
                .build();
    }
}
