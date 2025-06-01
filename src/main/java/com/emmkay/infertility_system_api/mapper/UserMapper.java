package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system_api.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system_api.dto.request.UserCreateRequest;
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
    User toUser(UserCreateRequest request);

    @Mapping(target = "roleName", ignore = true)
    User toUser(AdminUserCreateRequest request);

    UserResponse toUserResponse(User user);

    AdminUserResponse toAdminUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    @Mapping(target = "password", ignore = true)
    void adminUpdateUser(@MappingTarget User user, AdminUserUpdateRequest request);
}
