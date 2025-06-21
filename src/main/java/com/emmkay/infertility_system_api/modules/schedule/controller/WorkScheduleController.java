package com.emmkay.infertility_system_api.modules.schedule.controller;


import com.emmkay.infertility_system_api.modules.schedule.dto.request.BulkWorkScheduleRequest;
import com.emmkay.infertility_system_api.modules.schedule.dto.request.WorkScheduleCreateRequest;
import com.emmkay.infertility_system_api.modules.schedule.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.modules.schedule.dto.response.WorkScheduleMonthlyResponse;
import com.emmkay.infertility_system_api.modules.schedule.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system_api.modules.schedule.service.WorkScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/work-schedule")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkScheduleController {

    WorkScheduleService workScheduleService;


    @PostMapping()
    public ApiResponse<WorkScheduleResponse> createWorkSchedule(@RequestBody @Valid WorkScheduleCreateRequest request) {
        return ApiResponse.<WorkScheduleResponse>builder()
                .result(workScheduleService.createWorkSchedule(request))
                .build();
    }

    @PutMapping("/{doctorId}")
    public ApiResponse<WorkScheduleResponse> updateWorkSchedule(
            @RequestBody @Valid WorkScheduleUpdateRequest request, @PathVariable String doctorId) {
        return ApiResponse.<WorkScheduleResponse>builder()
                .result(workScheduleService.updateWorkSchedule(request, doctorId))
                .build();
    }

    @GetMapping("this-month/{doctorId}")
    public ApiResponse<WorkScheduleMonthlyResponse> getWorkScheduleThisMonth(@PathVariable String doctorId) {
        return ApiResponse.<WorkScheduleMonthlyResponse>builder()
                .result(workScheduleService.getWorkScheduleThisMonthByDoctorId(doctorId))
                .build();
    }

    @PostMapping("/bulk-create")
    public ApiResponse<String> bulkCreateSchedule(@RequestBody @Valid BulkWorkScheduleRequest request) {
        workScheduleService.bulkCreateMonthlySchedule(request);
        return ApiResponse.<String>builder()
                .result("Tạo lịch làm cho bác sĩ thành công")
                .build();
    }

    @DeleteMapping("/{date}/{doctorId}")
    public ApiResponse<String> deleteWorkScheduleByDateAndDoctor(
            @PathVariable LocalDate date,
            @PathVariable String doctorId) {
        workScheduleService.deleteWorkScheduleByDateAndDoctor(date, doctorId);
        return ApiResponse.<String>builder()
                .result("Xóa lịch làm cho bác sĩ thành công")
                .build();
    }

    @GetMapping("/{yearMonth}/{doctorId}")
    @Operation(summary = "yearMonth: yyyy-MM")
    public ApiResponse<WorkScheduleMonthlyResponse> getWorkScheduleByMonthAndDoctor(@PathVariable String yearMonth, @PathVariable String doctorId) {
        return ApiResponse.<WorkScheduleMonthlyResponse>builder()
                .result(workScheduleService.getWorkScheduleByMonthAndByDoctorId(doctorId, yearMonth))
                .build();
    }

}
