package com.emmkay.infertility_system.modules.authentication.dto.request;

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
public class VerifyOtpRequest {
    @NotBlank(message = "{validation.required}")
    @Email(message = "{invalid.email}")
    String email;
    @NotBlank(message = "{validation.required}")
    @Size(min = 6, max = 6, message = "{validation.otp.size}")
    String otp;
}
