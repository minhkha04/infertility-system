package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.DoctorResponse;
import com.emmkay.infertility_system_api.entity.Doctor;
import com.emmkay.infertility_system_api.entity.User;
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
    DoctorResponse toDoctorResponse(Doctor doctor);

    Doctor toDoctor(User user);


    @Mapping(target = "user.roleName", ignore = true)
    void updateDoctor(@MappingTarget Doctor doctor, DoctorUpdateRequest request);
}
