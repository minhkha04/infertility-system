package com.emmkay.infertility_system_api.mapper;

import com.emmkay.infertility_system_api.dto.request.UserCreationRequest;
import com.emmkay.infertility_system_api.dto.response.UserResponse;
import com.emmkay.infertility_system_api.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);
}
