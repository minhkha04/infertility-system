package com.emmkay.infertility_system.modules.doctor.mapper;

import com.emmkay.infertility_system.modules.doctor.dto.request.DoctorUpdateRequest;
import com.emmkay.infertility_system.modules.doctor.dto.response.DoctorResponse;
import com.emmkay.infertility_system.modules.doctor.entity.Doctor;
import com.emmkay.infertility_system.modules.user.dto.response.RoleResponse;
import com.emmkay.infertility_system.modules.user.entity.Role;
import com.emmkay.infertility_system.modules.user.entity.User;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-14T11:23:15+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class DoctorMapperImpl implements DoctorMapper {

    @Override
    public DoctorResponse toDoctorResponse(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }

        DoctorResponse.DoctorResponseBuilder<?, ?> doctorResponse = DoctorResponse.builder();

        doctorResponse.fullName( doctorUsersFullName( doctor ) );
        doctorResponse.phoneNumber( doctorUsersPhoneNumber( doctor ) );
        doctorResponse.gender( doctorUsersGender( doctor ) );
        doctorResponse.dateOfBirth( doctorUsersDateOfBirth( doctor ) );
        doctorResponse.address( doctorUsersAddress( doctor ) );
        doctorResponse.username( doctorUsersUsername( doctor ) );
        doctorResponse.email( doctorUsersEmail( doctor ) );
        doctorResponse.roleName( roleToRoleResponse( doctorUsersRoleName( doctor ) ) );
        doctorResponse.avatarUrl( doctorUsersAvatarUrl( doctor ) );
        doctorResponse.id( doctor.getId() );
        doctorResponse.qualifications( doctor.getQualifications() );
        doctorResponse.graduationYear( doctor.getGraduationYear() );
        doctorResponse.experienceYears( doctor.getExperienceYears() );
        doctorResponse.specialty( doctor.getSpecialty() );
        doctorResponse.isPublic( doctor.getIsPublic() );

        return doctorResponse.build();
    }

    @Override
    public void updateDoctor(Doctor doctor, DoctorUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        if ( doctor.getUsers() == null ) {
            doctor.setUsers( User.builder().build() );
        }
        doctorUpdateRequestToUser( request, doctor.getUsers() );
        doctor.setQualifications( request.getQualifications() );
        doctor.setGraduationYear( request.getGraduationYear() );
        doctor.setExperienceYears( request.getExperienceYears() );
        doctor.setSpecialty( request.getSpecialty() );
    }

    private String doctorUsersFullName(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String fullName = users.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String doctorUsersPhoneNumber(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String phoneNumber = users.getPhoneNumber();
        if ( phoneNumber == null ) {
            return null;
        }
        return phoneNumber;
    }

    private String doctorUsersGender(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String gender = users.getGender();
        if ( gender == null ) {
            return null;
        }
        return gender;
    }

    private LocalDate doctorUsersDateOfBirth(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        LocalDate dateOfBirth = users.getDateOfBirth();
        if ( dateOfBirth == null ) {
            return null;
        }
        return dateOfBirth;
    }

    private String doctorUsersAddress(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String address = users.getAddress();
        if ( address == null ) {
            return null;
        }
        return address;
    }

    private String doctorUsersUsername(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String username = users.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private String doctorUsersEmail(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String email = users.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private Role doctorUsersRoleName(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        Role roleName = users.getRoleName();
        if ( roleName == null ) {
            return null;
        }
        return roleName;
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

    private String doctorUsersAvatarUrl(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User users = doctor.getUsers();
        if ( users == null ) {
            return null;
        }
        String avatarUrl = users.getAvatarUrl();
        if ( avatarUrl == null ) {
            return null;
        }
        return avatarUrl;
    }

    protected void doctorUpdateRequestToUser(DoctorUpdateRequest doctorUpdateRequest, User mappingTarget) {
        if ( doctorUpdateRequest == null ) {
            return;
        }

        mappingTarget.setEmail( doctorUpdateRequest.getEmail() );
    }
}
