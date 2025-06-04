package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.projection.DoctorRatingProjection;
import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorRatingResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorWorkScheduleResponse;
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

    @PutMapping()
    public ApiResponse<DoctorResponse> updateDoctor(@RequestBody @Valid DoctorUpdateRequest request, String id) {
        DoctorResponse updatedDoctor = doctorService.updateDoctor(id, request);
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

    @GetMapping("/schedules/next-14-days/{id}")
    public DoctorWorkScheduleResponse getDoctorSchedulesNext14Days(@PathVariable("id") String doctorId) {
        return doctorService.getDoctorScheduleNext14Days(doctorId);
    }

    @GetMapping("/rating")
    public ApiResponse<List<DoctorRatingResponse>> getDoctorRating() {
        return ApiResponse.<List<DoctorRatingResponse>>builder()
                .result(doctorService.getAllDoctorRating())
                .build();
    }
}
