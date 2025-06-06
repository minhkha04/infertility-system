package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.*;
import com.emmkay.infertility_system_api.service.AppointmentService;
import com.emmkay.infertility_system_api.service.ManagerService;
import com.emmkay.infertility_system_api.service.WorkScheduleService;
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
    public ApiResponse<ManagerDashboardWorkScheduleStaticsResponse> getWorkSchedulesForManagerDashboardStatics() {
        return ApiResponse.<ManagerDashboardWorkScheduleStaticsResponse>builder()
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
}
