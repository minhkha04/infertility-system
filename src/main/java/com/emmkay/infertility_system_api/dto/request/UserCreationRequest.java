package com.emmkay.infertility_system_api.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    String username;
    String password;
    String fullName;
    String email;
    String phoneNumber;
    String gender;
    LocalDate dateOfBirth;
}
