package com.emmkay.infertility_system_api.modules.doctor.controller;


import com.emmkay.infertility_system_api.modules.doctor.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.modules.doctor.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.modules.doctor.dto.response.DoctorWorkScheduleResponse;
import com.emmkay.infertility_system_api.modules.doctor.projection.DoctorSelectProjection;
import com.emmkay.infertility_system_api.modules.doctor.service.DoctorService;
import com.emmkay.infertility_system_api.modules.shared.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/doctors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorController {

    DoctorService  doctorService;

    @PutMapping("/{doctorId}")
    public ApiResponse<DoctorResponse> updateDoctor(@RequestBody @Valid DoctorUpdateRequest request, @PathVariable String doctorId) {
        DoctorResponse updatedDoctor = doctorService.updateDoctor(doctorId, request);
        return ApiResponse.<DoctorResponse>builder()
                .result(updatedDoctor)
                .build();
    }

    @GetMapping("/select/options/schedule")
    public ApiResponse<List<DoctorSelectProjection>> getDoctorsToCreateSchedule() {
        return ApiResponse.<List<DoctorSelectProjection>>builder()
                .result(doctorService.getDoctorsToCreateSchedule())
                .build();
    }

    @GetMapping("/available")
    public ApiResponse<List<DoctorSelectProjection>> getAvailableDoctors(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String shift
    ) {
        return ApiResponse.<List<DoctorSelectProjection>>builder()
                .result(doctorService.getAvailableDoctors(date, shift))
                .build();
    }

    @GetMapping("/schedules/{doctorId}")
    public ApiResponse<DoctorWorkScheduleResponse> getDoctorSchedules(@PathVariable String doctorId) {
        return ApiResponse.<DoctorWorkScheduleResponse>builder()
                .result(doctorService.getDoctorSchedule(doctorId))
                .build();
    }
}
