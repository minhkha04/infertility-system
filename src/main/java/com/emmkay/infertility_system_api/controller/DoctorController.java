package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.*;
import com.emmkay.infertility_system_api.service.DoctorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorController {

    DoctorService  doctorService;

    @GetMapping()
    public ApiResponse<List<DoctorResponse>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorService.getAllDoctors();
        return ApiResponse.<List<DoctorResponse>>builder()
                .result(doctors)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorResponse> getDoctorById(@PathVariable String id) {
        DoctorResponse doctor = doctorService.getDoctorById(id);
        return ApiResponse.<DoctorResponse>builder()
                .result(doctor)
                .build();
    }

    @PutMapping("/{doctorId}")
    public ApiResponse<DoctorResponse> updateDoctor(@RequestBody @Valid DoctorUpdateRequest request, @PathVariable String doctorId) {
        DoctorResponse updatedDoctor = doctorService.updateDoctor(doctorId, request);
        return ApiResponse.<DoctorResponse>builder()
                .result(updatedDoctor)
                .build();
    }

    @GetMapping("/available")
    public ApiResponse<List<DoctorResponse>> getAvailableDoctors(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String shift
    ) {
        List<DoctorResponse> availableDoctors = doctorService.getAvailableDoctors(date, shift);
        return ApiResponse.<List<DoctorResponse>>builder()
                .result(availableDoctors)
                .build();
    }

    @GetMapping("/schedules/{doctorId}")
    public ApiResponse<DoctorWorkScheduleResponse> getDoctorSchedules(@PathVariable String doctorId) {
        return ApiResponse.<DoctorWorkScheduleResponse>builder()
                .result(doctorService.getDoctorSchedule(doctorId))
                .build();
    }

    @GetMapping("/rating")
    public ApiResponse<List<DoctorRatingResponse>> getDoctorRating() {
        return ApiResponse.<List<DoctorRatingResponse>>builder()
                .result(doctorService.getAllDoctorRating())
                .build();
    }

    @GetMapping("/dashboard/statics/{doctorId}")
    public ApiResponse<DoctorDashboardResponse> getDoctorDashBoardResponse(@PathVariable String doctorId) {
        return ApiResponse.<DoctorDashboardResponse>builder()
                .result(doctorService.getDoctorDashBoard(doctorId))
                .build();
    }


}
