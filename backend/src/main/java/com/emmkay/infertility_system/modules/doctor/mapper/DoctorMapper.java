package com.emmkay.infertility_system.modules.doctor.mapper;

import com.emmkay.infertility_system.modules.doctor.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system.modules.doctor.dto.response.DoctorResponse;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    @Mapping(target = "fullName", source = "users.fullName")
    @Mapping(target = "phoneNumber", source = "users.phoneNumber")
    @Mapping(target = "gender", source = "users.gender")
    @Mapping(target = "dateOfBirth", source = "users.dateOfBirth")
    @Mapping(target = "address", source = "users.address")
    @Mapping(target = "username", source = "users.username")
    @Mapping(target = "email", source = "users.email")
    @Mapping(target = "roleName", source = "users.roleName")
    @Mapping(target = "avatarUrl", source = "users.avatarUrl")
    DoctorResponse toDoctorResponse(Doctor doctor);

    @Mapping(target = "users.roleName", ignore = true)
    @Mapping(target = "users.email.", source = "email")
    void updateDoctor(@MappingTarget Doctor doctor, DoctorUpdateRequest request);
}
