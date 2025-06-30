package com.emmkay.infertility_system.modules.dashboard.controller;

import com.emmkay.infertility_system.modules.dashboard.projection.AdminCountRoleProjection;
import com.emmkay.infertility_system.modules.dashboard.service.AdminDashboardService;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
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
@RequestMapping("/api/v1/dashboard/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    AdminDashboardService adminStatisticsService;

    @GetMapping("/users-by-role")
    public ApiResponse<List<AdminCountRoleProjection>> getUserCountByRole() {
        return ApiResponse.<List<AdminCountRoleProjection>>builder()
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
