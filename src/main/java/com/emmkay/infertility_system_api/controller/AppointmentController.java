package com.emmkay.infertility_system_api.controller;

import com.emmkay.infertility_system_api.dto.request.*;
import com.emmkay.infertility_system_api.dto.response.ApiResponse;
import com.emmkay.infertility_system_api.dto.response.AppointmentInNext7DayResponse;
import com.emmkay.infertility_system_api.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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


    @GetMapping("/doctor/{doctorId}/{date}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentsByDoctor(@PathVariable String doctorId, @PathVariable LocalDate date) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentsForDoctorByDate(doctorId, date))
                .build();
    }

    @Operation(summary = "for customer to change appointment")
    @PutMapping("/request-change/{appointmentId})")
    public ApiResponse<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestBody @Valid
            ChangeAppointmentByCustomerRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.changeAppointmentForCustomer(appointmentId, request))
                .build();
    }

    @PostMapping()
    public ApiResponse<AppointmentResponse> createAppointment(
            @RequestBody @Valid AppointmentCreateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.createAppointment(request))
                .build();
    }

    @Operation(summary = "for doctor or manager to confirm appointment")
    @PutMapping("confirm-appointment/{appointmentId}")
    public ApiResponse<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody @Valid ConfirmChangeAppointmentRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.confirmChangeAppointment(appointmentId, request))
                .build();
    }

    @GetMapping("/get-all")
    public ApiResponse<List<AppointmentResponse>> getAllAppointments() {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAllAppointments())
                .build();
    }

    @Operation(summary = "for doctor to get appointments with status pending change")
    @GetMapping("/with-status-pending-change/{doctorId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentsWithStatusPendingChange(@PathVariable String doctorId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentWithStatusPendingChangeByDoctorId(doctorId))
                .build();
    }

    @PutMapping("change-appointment-by-doctor-or-manager/{appointmentId}")
    public ApiResponse<AppointmentResponse> changeByDoctorOrManger(@PathVariable Long appointmentId, @RequestBody @Valid ChangeAppointmentByDoctorOrManagerRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.changeAppointmentForManagerOrDoctor(appointmentId, request))
                .build();
    }

    @Operation(summary = "for doctor to get appointments in next 7 days")
    @GetMapping("/appointment-in-next-7-day/{doctorId}")
    public ApiResponse<List<AppointmentInNext7DayResponse>> getAppointmentInNext7Day(@PathVariable String doctorId) {
        return ApiResponse.<List<AppointmentInNext7DayResponse>>builder()
                .result(appointmentService.getAppointInNext7Day(doctorId))
                .build();
    }

    @PutMapping("/update-status/{appointmentId}/{status}")
    public ApiResponse<AppointmentResponse> updateAppointmentStatus(@PathVariable Long appointmentId, @PathVariable String status) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.updateStatus(appointmentId, status))
                .build();
    }

    @Operation(summary = "for doctor or manager cancel appointment")
    @PutMapping("/cancel")
    public ApiResponse<AppointmentResponse> cancelAppointment(
            @RequestBody @Valid AppointmentCancelRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.cancelAppointment(request))
                .build();
    }

    @GetMapping("get-by-step-id/{stepId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentByStepId(@PathVariable Long stepId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentByStepId(stepId))
                .build();
    }

}
