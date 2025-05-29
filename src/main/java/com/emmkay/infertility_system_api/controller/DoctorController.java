package com.emmkay.infertility_system_api.controller;


import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.request.UploadImageRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.service.CloudinaryService;
import com.emmkay.infertility_system_api.service.DoctorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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


}
