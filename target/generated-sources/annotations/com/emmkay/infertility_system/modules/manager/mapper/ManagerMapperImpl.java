package com.emmkay.infertility_system.modules.manager.mapper;

import com.emmkay.infertility_system.modules.manager.dto.request.ManagerUpdateRequest;
import com.emmkay.infertility_system.modules.manager.dto.response.ManagerResponse;
import com.emmkay.infertility_system.modules.user.dto.response.RoleResponse;
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
public class ManagerMapperImpl implements ManagerMapper {

    @Override
    public void updateManager(User user, ManagerUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setEmail( request.getEmail() );
        user.setFullName( request.getFullName() );
        user.setPhoneNumber( request.getPhoneNumber() );
        user.setGender( request.getGender() );
        user.setDateOfBirth( request.getDateOfBirth() );
        user.setAddress( request.getAddress() );
    }

    @Override
    public ManagerResponse toManagerResponse(User user) {
        if ( user == null ) {
            return null;
        }

        ManagerResponse.ManagerResponseBuilder<?, ?> managerResponse = ManagerResponse.builder();

        managerResponse.id( user.getId() );
        managerResponse.username( user.getUsername() );
        managerResponse.fullName( user.getFullName() );
        managerResponse.email( user.getEmail() );
        managerResponse.phoneNumber( user.getPhoneNumber() );
        managerResponse.gender( user.getGender() );
        managerResponse.dateOfBirth( user.getDateOfBirth() );
        managerResponse.roleName( roleToRoleResponse( user.getRoleName() ) );
        managerResponse.address( user.getAddress() );
        managerResponse.avatarUrl( user.getAvatarUrl() );
        managerResponse.isRemoved( user.getIsRemoved() );
        managerResponse.isVerified( user.getIsVerified() );

        return managerResponse.build();
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
