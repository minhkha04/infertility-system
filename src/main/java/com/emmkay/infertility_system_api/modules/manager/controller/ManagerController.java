package com.emmkay.infertility_system_api.modules.manager.controller;

import com.emmkay.infertility_system_api.modules.manager.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system_api.modules.manager.dto.response.*;
import com.emmkay.infertility_system_api.modules.manager.service.ManagerService;
import com.emmkay.infertility_system_api.modules.schedule.dto.response.WorkScheduleForManagerDashboardResponse;
import com.emmkay.infertility_system_api.modules.schedule.service.WorkScheduleService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentRecordService;
import com.emmkay.infertility_system_api.modules.treatment.service.TreatmentServiceService;
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
    public ApiResponse<ManagerResponse> updateManagerProfile(String userId, @RequestBody @Valid ManagerUpdateRequest request) {
        return ApiResponse.<ManagerResponse>builder()
                .result(managerService.updateManagerProfile(userId, request))
                .build();
    }

    @GetMapping("/dashboard/work-schedules-doctor-today")
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
