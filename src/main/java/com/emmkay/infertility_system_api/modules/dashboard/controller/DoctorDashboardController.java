package com.emmkay.infertility_system_api.modules.dashboard.controller;

import com.emmkay.infertility_system_api.modules.dashboard.projection.DoctorTodayAppointmentProjection;
import com.emmkay.infertility_system_api.modules.dashboard.service.DoctorDashboardService;
import com.emmkay.infertility_system_api.modules.dashboard.view.DoctorDashboardOverview;
import com.emmkay.infertility_system_api.modules.schedule.projection.WorkScheduleDateShiftProjection;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.shared.dto.response.PageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard/doctor")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorDashboardController {
    DoctorDashboardService doctorDashboardService;

    @GetMapping("/overview")
    public ApiResponse<DoctorDashboardOverview> getOverview() {
        return ApiResponse.<DoctorDashboardOverview>builder()
                .result(doctorDashboardService.getOverview())
                .build();
    }

    @GetMapping("/appointment-today")
    public ApiResponse<PageResponse<DoctorTodayAppointmentProjection>> getTodayAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<DoctorTodayAppointmentProjection> result = doctorDashboardService.getTodayAppointments(page, size);
        return ApiResponse.<PageResponse<DoctorTodayAppointmentProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/work-schedule")
    public ApiResponse<List<WorkScheduleDateShiftProjection>> getWorkScheduleByDoctorId(
            @RequestParam YearMonth yearMonth
    ) {
        return ApiResponse.<List<WorkScheduleDateShiftProjection>>builder()
                .result(doctorDashboardService.getWorkScheduleByDoctorId(yearMonth))
                .build();
    }
}
