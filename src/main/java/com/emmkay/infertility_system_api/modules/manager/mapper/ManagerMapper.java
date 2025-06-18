package com.emmkay.infertility_system_api.modules.manager.mapper;

import com.emmkay.infertility_system_api.modules.manager.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system_api.modules.manager.dto.response.ManagerResponse;
import com.emmkay.infertility_system_api.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ManagerMapper {

    @Mapping(target = "roleName", ignore = true)
    @Mapping(target = "email", source = "email")
    void updateManager(@MappingTarget User user, ManagerUpdateRequest request);


    ManagerResponse toManagerResponse(User user);

}
