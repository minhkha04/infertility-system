package com.emmkay.infertility_system.modules.user.mapper;

import com.emmkay.infertility_system.modules.user.dto.response.RoleResponse;
import com.emmkay.infertility_system.modules.user.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
}
