package com.emmkay.infertility_system_api.mapper;


import com.emmkay.infertility_system_api.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system_api.dto.request.RescheduleAppointmentRequest;
import com.emmkay.infertility_system_api.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "doctorName", source = "doctor.users.fullName")
    @Mapping(target = "serviceName", source = "treatmentStep.record.service.name")
    AppointmentResponse toAppointmentResponse(Appointment appointment);


    void updateStatusAppointment(@MappingTarget Appointment appointment, RescheduleAppointmentRequest request);

    Appointment toAppointment(AppointmentCreateRequest request);
}
