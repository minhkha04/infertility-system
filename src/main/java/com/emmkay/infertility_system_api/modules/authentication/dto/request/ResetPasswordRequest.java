package com.emmkay.infertility_system_api.modules.authentication.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {
    @NotBlank(message = "{validation.required}")
    @Email(message = "{invalid.email}")
    String email;
    @NotBlank(message = "{validation.required}")
    @Size(min = 8, max = 20, message = "{validation.password.size}")
    String password;
    String otp;
}
