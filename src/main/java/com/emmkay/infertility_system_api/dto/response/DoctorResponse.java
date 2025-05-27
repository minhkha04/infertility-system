package com.emmkay.infertility_system_api.dto.response;

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

    String avatarUrl;
    String qualifications;
    Integer graduationYear;
    Integer experienceYears;

}
