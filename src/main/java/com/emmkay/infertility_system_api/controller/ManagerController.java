package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.*;
import com.emmkay.infertility_system_api.entity.TreatmentService;
import com.emmkay.infertility_system_api.service.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/managers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    ManagerService managerService;
    WorkScheduleService workScheduleService;
    AppointmentService appointmentService;
    TreatmentRecordService treatmentRecordService;
    TreatmentServiceService treatmentServiceService;

    @PutMapping()
    public ApiResponse<ManagerResponse> updateManagerProfile(String userId,@RequestBody @Valid ManagerUpdateRequest request) {
        return ApiResponse.<ManagerResponse>builder()
                .result(managerService.updateManagerProfile(userId, request))
                .build();
    }

    @GetMapping("/dashboard/work-schedules")
    public ApiResponse<List<WorkScheduleForManagerDashboardResponse>> getWorkSchedulesForManagerDashboard() {
        return ApiResponse.<List<WorkScheduleForManagerDashboardResponse>>builder()
                .result(workScheduleService.getWorkSchedulesForManagerDashboard())
                .build();
    }

    @GetMapping("/dashboard/work-schedules/statics/")
    public ApiResponse<ManagerDashboardWorkScheduleStatisticsResponse> getWorkSchedulesForManagerDashboardStatics() {
        return ApiResponse.<ManagerDashboardWorkScheduleStatisticsResponse>builder()
                .result(workScheduleService.getManagerWorkScheduleTodayDashBoard())
                .build();
    }

    @Operation(summary = "for manager to get all appointments today")
    @GetMapping("/dashboard/get-all-appointments-today")
    public ApiResponse<List<AppointmentResponse>> getAllAppointmentToday() {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAllAppointmentTodayForManager())
                .build();
    }

    @Operation(summary = "for manager to statistic")
    @GetMapping("/dashboard/statistic")
    public ApiResponse<ManagerDashboardStatisticsResponse> getStatisticForManagerDashboard() {
        return ApiResponse.<ManagerDashboardStatisticsResponse>builder()
                .result(treatmentRecordService.getManagerDashboardStatistics())
                .build();
    }

    @Operation(summary = "for manager dashboard service")
    @GetMapping("/dashboard/service")
    public ApiResponse<List<ManagerDashboardServiceResponse>> getStatisticForManagerDashboardService() {
        return ApiResponse.<List<ManagerDashboardServiceResponse>>builder()
                .result(treatmentServiceService.getManagerDashboardService())
                .build();
    }

    @Operation(summary = "for manager chart")
    @GetMapping("/dashboard/chart")
    public ApiResponse<List<ManagerDashboardChartResponse>> getManagerDashboardChart() {
        return ApiResponse.<List<ManagerDashboardChartResponse>>builder()
                .result(treatmentServiceService.getManagerDashboardChart())
                .build();
    }
}
