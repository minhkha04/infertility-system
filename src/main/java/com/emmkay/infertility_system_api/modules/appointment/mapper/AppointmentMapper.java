package com.emmkay.infertility_system_api.modules.appointment.mapper;


import com.emmkay.infertility_system_api.modules.appointment.dto.request.AppointmentCreateRequest;
import com.emmkay.infertility_system_api.modules.appointment.dto.request.ChangeAppointmentByCustomerRequest;
import com.emmkay.infertility_system_api.modules.appointment.dto.response.AppointmentResponse;
import com.emmkay.infertility_system_api.modules.appointment.entity.Appointment;
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


    void requestChangeAppointment(@MappingTarget Appointment appointment, ChangeAppointmentByCustomerRequest request);

    Appointment toAppointment(AppointmentCreateRequest request);
}
