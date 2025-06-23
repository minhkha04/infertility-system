package com.emmkay.infertility_system_api.modules.doctor.dto.response;

import com.emmkay.infertility_system_api.modules.user.dto.response.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class DoctorResponse extends UserResponse {
    String qualifications;
    Integer graduationYear;
    Integer experienceYears;
    String specialty;
    Boolean isPublic;
}
