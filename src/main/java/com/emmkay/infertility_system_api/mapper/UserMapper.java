package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.AdminUserCreationRequest;
import com.emmkay.infertility_system_api.dto.request.UserCreationRequest;
import com.emmkay.infertility_system_api.dto.request.UserUpdateRequest;
import com.emmkay.infertility_system_api.dto.response.AdminUserResponse;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", ignore = true)
    User toUser(UserCreationRequest request);

    @Mapping(target = "roleName", ignore = true)
    User toUser(AdminUserCreationRequest request);

    UserResponse toUserResponse(User user);

    AdminUserResponse toAdminUserResponse(User user);

    @Mapping(target = "roleName", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
