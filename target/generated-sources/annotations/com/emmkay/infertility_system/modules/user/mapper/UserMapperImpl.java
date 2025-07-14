package com.emmkay.infertility_system.modules.user.mapper;

import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserCreateRequest;
import com.emmkay.infertility_system.modules.admin.dto.request.AdminUserUpdateRequest;
import com.emmkay.infertility_system.modules.user.dto.request.UserCreateRequest;
import com.emmkay.infertility_system.modules.user.dto.request.UserUpdateRequest;
import com.emmkay.infertility_system.modules.user.dto.response.RoleResponse;
import com.emmkay.infertility_system.modules.user.dto.response.UserResponse;
import com.emmkay.infertility_system.modules.user.entity.Role;
import com.emmkay.infertility_system.modules.user.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:13+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(UserCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.username( request.getUsername() );
        user.password( request.getPassword() );
        user.fullName( request.getFullName() );
        user.email( request.getEmail() );
        user.phoneNumber( request.getPhoneNumber() );
        user.gender( request.getGender() );
        user.dateOfBirth( request.getDateOfBirth() );
        user.address( request.getAddress() );

        return user.build();
    }

    @Override
    public User toUser(AdminUserCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.username( request.getUsername() );
        user.password( request.getPassword() );

        return user.build();
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder<?, ?> userResponse = UserResponse.builder();

        userResponse.id( user.getId() );
        userResponse.username( user.getUsername() );
        userResponse.fullName( user.getFullName() );
        userResponse.email( user.getEmail() );
        userResponse.phoneNumber( user.getPhoneNumber() );
        userResponse.gender( user.getGender() );
        userResponse.dateOfBirth( user.getDateOfBirth() );
        userResponse.roleName( roleToRoleResponse( user.getRoleName() ) );
        userResponse.address( user.getAddress() );
        userResponse.avatarUrl( user.getAvatarUrl() );
        userResponse.isRemoved( user.getIsRemoved() );
        userResponse.isVerified( user.getIsVerified() );

        return userResponse.build();
    }

    @Override
    public void updateUser(User user, UserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setFullName( request.getFullName() );
        user.setPhoneNumber( request.getPhoneNumber() );
        user.setGender( request.getGender() );
        user.setDateOfBirth( request.getDateOfBirth() );
        user.setAddress( request.getAddress() );
    }

    @Override
    public void adminUpdateUser(User user, AdminUserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setFullName( request.getFullName() );
        user.setEmail( request.getEmail() );
        user.setPhoneNumber( request.getPhoneNumber() );
        user.setGender( request.getGender() );
        user.setDateOfBirth( request.getDateOfBirth() );
        user.setAddress( request.getAddress() );
    }

    protected RoleResponse roleToRoleResponse(Role role) {
        if ( role == null ) {
            return null;
        }

        RoleResponse.RoleResponseBuilder roleResponse = RoleResponse.builder();

        roleResponse.name( role.getName() );
        roleResponse.description( role.getDescription() );

        return roleResponse.build();
    }
}
