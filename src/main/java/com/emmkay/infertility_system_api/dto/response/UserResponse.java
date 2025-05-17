package com.emmkay.infertility_system_api.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserResponse {
    String id;
    String username;
    String fullName;
    String email;
    String phoneNumber;
    String gender;
    LocalDate dateOfBirth;
    RoleResponse roleName;
}
