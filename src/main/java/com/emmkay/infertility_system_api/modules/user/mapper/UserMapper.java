package com.emmkay.infertility_system_api.modules.user.mapper;

import com.emmkay.infertility_system_api.modules.admin.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system_api.modules.admin.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserCreateRequest;
import com.emmkay.infertility_system_api.modules.user.dto.request.UserUpdateRequest;
import com.emmkay.infertility_system_api.modules.admin.dto.response.AdminUserResponse;
import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system_api.modules.user.entity.User;
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
