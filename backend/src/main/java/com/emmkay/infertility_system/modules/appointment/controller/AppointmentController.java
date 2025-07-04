package com.emmkay.infertility_system.modules.appointment.controller;

import com.emmkay.infertility_system.modules.appointment.enums.AppointmentStatus;
import com.emmkay.infertility_system.modules.appointment.projection.AppointmentBasicProjection;
import com.emmkay.infertility_system.modules.shared.dto.response.ApiResponse;
import com.emmkay.infertility_system.modules.appointment.dto.request.*;
import com.emmkay.infertility_system.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system.modules.appointment.service.AppointmentService;
import com.emmkay.infertility_system.modules.shared.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentController {

    AppointmentService appointmentService;

    @GetMapping()
    public ApiResponse<PageResponse<AppointmentBasicProjection>> searchAppointments(
            @RequestParam(required = false) Long stepId,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AppointmentBasicProjection> result = appointmentService.searchAppointments(stepId, customerId, doctorId, date, status, page, size);
        return ApiResponse.<PageResponse<AppointmentBasicProjection>>builder()
                .result(PageResponse.from(result))
                .build();
    }

    @GetMapping("/{appointmentId}")
    public ApiResponse<AppointmentResponse> getAppointmentDetailById(@PathVariable Long appointmentId) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.getAppointmentDetail(appointmentId))
                .build();
    }

    @PutMapping("/{appointmentId}/customer-change")
    public ApiResponse<AppointmentResponse> customerChangeAppointment(
            @PathVariable Long appointmentId,
            @RequestBody @Valid
            ChangeAppointmentByCustomerRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.changeAppointmentForCustomer(appointmentId, request))
                .build();
    }
    @PostMapping("")
    public ApiResponse<AppointmentResponse> createAppointment(
            @RequestBody @Valid AppointmentCreateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.createAppointment(request))
                .build();
    }

    @PutMapping("/{appointmentId}/doctor-or-manager-change")
    public ApiResponse<AppointmentResponse> managerOrDoctorChangeAppointment(@PathVariable Long appointmentId, @RequestBody @Valid ChangeAppointmentByDoctorOrManagerRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.changeAppointmentForManagerOrDoctor(appointmentId, request))
                .build();
    }

    @PutMapping("/{appointmentId}/status")
    public ApiResponse<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody @Valid AppointmentStatusUpdateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.updateStatus(appointmentId, request))
                .build();
    }

    @PutMapping("/{appointmentId}")
    public ApiResponse<AppointmentResponse> updateAppointment(
            @PathVariable Long appointmentId,
            @RequestBody @Valid AppointmentUpdateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .result(appointmentService.updateAppointment(request, appointmentId))
                .build();
    }

    @GetMapping("/get-by-step/{stepId}")
    public ApiResponse<List<AppointmentResponse>> getAppointmentByStepId(@PathVariable long stepId) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .result(appointmentService.getAppointmentsByStepId(stepId))
                .build();
    }

}
