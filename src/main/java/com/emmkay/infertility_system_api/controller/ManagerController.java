package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.ManagerResponse;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleForManagerDashBoardResponse;
import com.emmkay.infertility_system_api.service.ManagerService;
import com.emmkay.infertility_system_api.service.WorkScheduleService;
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


    @PutMapping()
    public ApiResponse<ManagerResponse> updateManagerProfile(String userId,@RequestBody @Valid ManagerUpdateRequest request) {
        return ApiResponse.<ManagerResponse>builder()
                .result(managerService.updateManagerProfile(userId, request))
                .build();
    }

    @GetMapping("/dashboard/work-schedules")
    public ApiResponse<List<WorkScheduleForManagerDashBoardResponse>> getWorkSchedulesForManagerDashboard() {
        return ApiResponse.<List<WorkScheduleForManagerDashBoardResponse>>builder()
                .result(workScheduleService.getWorkSchedulesForManagerDashboard())
                .build();
    }
}
