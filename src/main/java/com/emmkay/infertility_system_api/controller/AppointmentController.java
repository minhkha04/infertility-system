package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system_api.dto.request.AppointmentUpdateStatusRequest;
import com.emmkay.infertility_system_api.dto.request.RescheduleAppointmentRequest;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentController {

    AppointmentService appointmentService;

    @GetMapping("/customer/{customerId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentsByCustomerId(@PathVariable String customerId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentsForCustomer(customerId))
                .build();
    }

    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentsByDoctorId(@PathVariable String doctorId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentsForDoctor(doctorId))
                .build();
    }

    @GetMapping("/doctor/today/{doctorId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentsByDoctorIdToday(@PathVariable String doctorId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentsForDoctorToday(doctorId))
                .build();
    }


    @PutMapping("/reschedule/customer/{appointmentId})")
    public ApiResponse<AppointmentResponse> rescheduleAppointmentForCustomer(
            @PathVariable Long appointmentId,
            @RequestBody @Valid RescheduleAppointmentRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.rescheduleAppointment(appointmentId, request))
                .build();
    }

    @PostMapping()
    public ApiResponse<AppointmentResponse> createAppointment(
            @RequestBody @Valid AppointmentCreateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.scheduleStepAppointment(request))
                .build();
    }

    @PutMapping("update-status/{appointmentId}")
    public ApiResponse<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody @Valid AppointmentUpdateStatusRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.updateAppointmentStatus(appointmentId, request))
                .build();
    }
}
