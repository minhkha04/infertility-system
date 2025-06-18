package com.emmkay.infertility_system_api.modules.doctor.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorRatingResponse {
    String fullName;
    String id;
    String avatarUrl;
    String qualifications;
    int experienceYears;
    String specialty;
    double rate;
}
