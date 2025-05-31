package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.request.BulkWorkScheduleRequest;
import com.emmkay.infertility_system_api.dto.request.WorkScheduleCreationRequest;
import com.emmkay.infertility_system_api.dto.request.WorkScheduleUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleMonthlyResponse;
import com.emmkay.infertility_system_api.dto.response.WorkScheduleResponse;
import com.emmkay.infertility_system_api.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/work-schedule")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkScheduleController {

    WorkScheduleService workScheduleService;


    @PostMapping()
    public ApiResponse<WorkScheduleResponse> createWorkSchedule(@RequestBody @Valid WorkScheduleCreationRequest request) {
        return ApiResponse.<WorkScheduleResponse>builder()
                .result(workScheduleService.createWorkSchedule(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkScheduleResponse> updateWorkSchedule(
            @PathVariable Long id,
            @RequestBody @Valid WorkScheduleUpdateRequest request) {
        return ApiResponse.<WorkScheduleResponse>builder()
                .result(workScheduleService.updateWorkSchedule(id, request))
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
        int createdCount = workScheduleService.bulkCreateMonthlySchedule(request);
        return ApiResponse.<String>builder()
                .result("Created " + createdCount + " work schedules for doctor " + request.getDoctorId())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteWorkSchedule(@PathVariable Long id) {
        workScheduleService.deleteWorkSchedule(id);
        return ApiResponse.<String>builder()
                .result("Work schedule with ID " + id + " has been deleted successfully.")
                .build();
    }

}
