package com.emmkay.infertility_system_api.modules.dashboard.controller;

import com.emmkay.infertility_system_api.modules.dashboard.projection.ManageRevenueServiceProjection;
import com.emmkay.infertility_system_api.modules.dashboard.projection.ManagerRevenueChartProjection;
import com.emmkay.infertility_system_api.modules.dashboard.projection.ManagerWorkScheduleDoctorTodayProjection;
import com.emmkay.infertility_system_api.modules.dashboard.service.ManagerDashboardService;
import com.emmkay.infertility_system_api.modules.dashboard.view.ManagerWorkStatisticsTodayView;
import com.emmkay.infertility_system_api.modules.dashboard.view.ManagerRevenueOverview;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentServiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/dashboard/manager")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('MANAGER')")
public class ManagerDashboardController {

    TreatmentServiceService treatmentServiceService;
    ManagerDashboardService managerDashboardService;


    @GetMapping("/work-schedules/statistics")
    public ApiResponse<ManagerWorkStatisticsTodayView> getWorkSchedulesForManagerDashboardStatics() {
        return ApiResponse.<ManagerWorkStatisticsTodayView>builder()
                .result(managerDashboardService.getWorkStatisticsToday())
                .build();
    }

    @GetMapping("/work-schedules/doctor-today")
    public ApiResponse<List<ManagerWorkScheduleDoctorTodayProjection>> getWorkSchedulesForManagerDashboardDoctorToday() {
        return ApiResponse.<List<ManagerWorkScheduleDoctorTodayProjection>>builder()
                .result(managerDashboardService.getWorkSchedulesForManagerDashboard())
                .build();
    }


    @GetMapping("/revenue/overview")
    public ApiResponse<ManagerRevenueOverview> getStatisticForManagerDashboard() {
        return ApiResponse.<ManagerRevenueOverview>builder()
                .result(managerDashboardService.getRevenueOverview())
                .build();
    }

    @GetMapping("/revenue/service")
    public ApiResponse<List<ManageRevenueServiceProjection>> getStatisticForManagerDashboardService() {
        return ApiResponse.<List<ManageRevenueServiceProjection>>builder()
                .result(managerDashboardService.getManagerDashboardService())
                .build();
    }

    @GetMapping("/revenue/chart")
    public ApiResponse<List<ManagerRevenueChartProjection>> getManagerDashboardChart() {
        return ApiResponse.<List<ManagerRevenueChartProjection>>builder()
                .result(managerDashboardService.getManagerRevenueChart())
                .build();
    }
}
