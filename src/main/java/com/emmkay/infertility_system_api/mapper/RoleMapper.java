package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.response.RoleResponse;
import com.emmkay.infertility_system_api.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);
}
