package com.emmkay.infertility_system.modules.appointment.mapper;


import com.emmkay.infertility_system.modules.appointment.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system.modules.appointment.dto.request.AppointmentUpdateRequest;
import com.emmkay.infertility_system.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system.modules.appointment.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "doctorName", source = "doctor.users.fullName")
    @Mapping(target = "doctorEmail", source = "doctor.users.email")
    @Mapping(target = "step", source = "treatmentStep.stepType")
    AppointmentResponse toAppointmentResponse(Appointment appointment);

    Appointment toAppointment(AppointmentCreateRequest request);

    void updateAppointment(@MappingTarget Appointment appointment, AppointmentUpdateRequest request);
}
